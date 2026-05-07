import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { StepHandlerFactory } from "src/queue/step-handler-factory";
import { MessageData } from "src/shared/utils/processRecivedData";
import { sendInteractiveButtons } from "src/shared/utils/sendInteractiveButtons";
import { saveMedia } from "src/shared/utils/saveMedia";
import { ChatService } from "../chat/chat.service";
import { CustomerService } from "../customer/customer.service";
import { MessageService } from "../message/message.service";
import { redisClient } from "src/shared/utils/redis";

@Processor("message-queue", {
  concurrency: 50,
  limiter: {
    max: 5,
    duration: 1000 // por 1 segundo
  }
})
export class WorkerProcessor extends WorkerHost {
  constructor(
    private readonly customerService: CustomerService,
    private readonly chatService: ChatService,
    private readonly messageService: MessageService,
    private readonly stepFactory: StepHandlerFactory
  ) {
    super();
  }

  override async process(job: Job<{ customerId: string }>) {
    if (job.name !== "process-customer") return;
    
    const { customerId } = job.data;
    const inboxKey = `inbox:${customerId}`;

    // Loop para garantir que mensagens que cheguem enquanto estamos processando sejam lidas
    while (true) {
      // 1. Pega todas as mensagens na Inbox deste cliente
      const messagesJson = await redisClient.lrange(inboxKey, 0, -1);
      
      if (!messagesJson || messagesJson.length === 0) {
        break; // Nenhuma mensagem nova, sai do loop e finaliza o job
      }

      // 2. Remove da inbox as mensagens que acabamos de ler
      await redisClient.ltrim(inboxKey, messagesJson.length, -1);

      // 3. Desserializa e ordena pelo timestamp do WhatsApp
      let messages: MessageData[] = messagesJson.map((m) => JSON.parse(m));
      messages = messages.sort((a, b) => a.timeLastMsg - b.timeLastMsg);

      // 4. Processa SEQUENCIALMENTE sem usar locks
      for (let i = 0; i < messages.length; i++) {
        const dataMsg = messages[i];

        // Idempotência baseada no messageId da Meta usando Redis (expira em 7 dias)
        const idempotencyKey = `processed_msg:${dataMsg.messageId}`;
        const alreadyProcessed = await redisClient.set(idempotencyKey, "1", "EX", 604800, "NX");
        
        if (!alreadyProcessed) {
          console.log(`Mensagem duplicada ignorada: ${dataMsg.messageId}`);
          continue; // Pula se já processado
        }

        try {
          if (dataMsg.downloadUrl && dataMsg.mediaId && process.env.ACCESS_TOKEN) {
            saveMedia(
              dataMsg.downloadUrl,
              process.env.ACCESS_TOKEN,
              dataMsg.mediaId
            ).catch((err) => console.error("Erro background download media:", err));
          }

          const customer = await this.customerService.findCustomer(dataMsg.customerId);

          if (!customer) {
            await this.customerService.createCustomer(
              dataMsg.customerId,
              dataMsg.name,
              dataMsg.phone
            );
          }

          const hasActiveChat = await this.chatService.findAndIsActive(dataMsg.customerId);

          if (!hasActiveChat) {
            const chat = await this.chatService.create(dataMsg.customerId);
            await this.messageService.createMessage(
              chat.id,
              dataMsg.msg,
              "CUSTOMER",
              dataMsg.type,
              dataMsg.mediaUrl ?? ""
            );
            await sendInteractiveButtons(
              dataMsg.phone,
              `Seja bem vindo a rede Match! 🚀🔥\nPara te redirecionarmos melhor, qual é o motivo do contato?`,
              [
                { id: "pedido", title: "Realizar um pedido" },
                { id: "feedback", title: "Quero dar feedback" },
                { id: "problema", title: "Estou com problemas" }
              ]
            );
            await this.messageService.createMessage(
              chat.id,
              "Mensagem redirecionamento empresa",
              "BOT",
              "TEXT",
              ""
            );

            continue;
          }

          const chatData = await this.chatService.findData(hasActiveChat.id);
          const handler = this.stepFactory.getHandler(chatData?.currentStep);
          await handler.handle(chatData, dataMsg);
        } catch (error) {
          console.error("Erro ao processar mensagem sequencial:", error);
          await redisClient.del(idempotencyKey); // Permite reprocessamento se der crash
          
          // Devolve esta mensagem e todas as subsequentes para a Inbox
          const remainingMessages = messages.slice(i);
          const remainingJson = remainingMessages.map(m => JSON.stringify(m));
          if (remainingJson.length > 0) {
            await redisClient.rpush(inboxKey, ...remainingJson);
          }
          
          throw error; // Repassa erro para a fila tentar novamente com backoff
        }
      }
    }
  }
}
