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
import { sendTextMessage } from "src/shared/utils/sendTextMessage";
import { Steps } from "@prisma/client";
import { ChatGateway } from "../chat/chat.gateway";

@Processor("message-queue", {
  concurrency: 50,
  limiter: {
    max: 50,
    duration: 1000 // por 1 segundo
  }
})
export class WorkerProcessor extends WorkerHost {
  constructor(
    private readonly customerService: CustomerService,
    private readonly chatService: ChatService,
    private readonly messageService: MessageService,
    private readonly stepFactory: StepHandlerFactory,
    private readonly chatGateway: ChatGateway
  ) {
    super();
  }

  override async process(job: Job<{ customerId: string }>) {
    if (job.name !== "process-customer") return;

    const { customerId } = job.data;
    const inboxKey = `inbox:${customerId}`;
    const lockKey = `lock:customer:${customerId}`;

    // Adquire Lock Distribuído por cliente no Redis (expira em 120s)
    const acquiredLock = await redisClient.set(lockKey, "1", "EX", 120, "NX");
    if (!acquiredLock) {
      console.log(`🔒 [Worker] Lock já ativo para customerId: ${customerId}. Outro worker está processando.`);
      return;
    }

    try {
      console.log(`👷 [Worker] Iniciando processamento do customerId: ${customerId}`);

      // Loop para garantir que mensagens que cheguem enquanto estamos processando sejam lidas
      while (true) {
      // 1 e 2. Pega e remove todas as mensagens na Inbox deste cliente de forma atômica via script Lua
      const luaScript = `
        local messages = redis.call('lrange', KEYS[1], 0, -1)
        if #messages > 0 then
          redis.call('ltrim', KEYS[1], #messages, -1)
        end
        return messages
      `;
      
      const messagesJson: string[] = await redisClient.eval(luaScript, 1, inboxKey) as string[];
      console.log(`👷 [Worker] Mensagens recuperadas do Redis para ${customerId}:`, messagesJson);

      if (!messagesJson || messagesJson.length === 0) {
        console.log(`👷 [Worker] Nenhuma mensagem no Redis para ${customerId}. Finalizando loop.`);
        break; // Nenhuma mensagem nova, sai do loop e finaliza o job
      }

      // 3. Desserializa e ordena pelo timestamp do WhatsApp
      let messages: MessageData[] = messagesJson.map((m) => JSON.parse(m));
      messages = messages.sort((a, b) => a.timeLastMsg - b.timeLastMsg);

      console.log(`👷 [Worker] Processando ${messages.length} mensagens sequencialmente.`);
      // 4. Processa SEQUENCIALMENTE sem usar locks
      for (let i = 0; i < messages.length; i++) {
        const dataMsg = messages[i];

        // Idempotência baseada no messageId da Meta usando Redis (expira em 7 dias)
        const idempotencyKey = `processed_msg:${dataMsg.messageId}`;
        const alreadyProcessed = await redisClient.set(idempotencyKey, "1", "EX", 604800, "NX");

        if (!alreadyProcessed) {
          continue; // Pula se já processado
        }

        try {
          console.log(`👷 [Worker] Processando mensagem id: ${dataMsg.messageId} de ${dataMsg.name} (${dataMsg.phone})`);
          if (dataMsg.downloadUrl && dataMsg.mediaId && process.env.ACCESS_TOKEN) {
            saveMedia(
              dataMsg.downloadUrl,
              process.env.ACCESS_TOKEN,
              dataMsg.mediaId
            ).catch((err) => console.error("Erro background download media:", err));
          }

          let customerData = await this.customerService.findCustomerData(dataMsg.customerId);
          console.log(`👷 [Worker] Dados do cliente (Prisma):`, customerData);

          if (!customerData) {
            console.log(`👷 [Worker] Cliente não existe no banco. Criando customerId: ${dataMsg.customerId}`);
            await this.customerService.createCustomer(
              dataMsg.customerId,
              dataMsg.name,
              dataMsg.phone
            );
            customerData = await this.customerService.findCustomerData(dataMsg.customerId);
          }

          const hasActiveChat = await this.chatService.findAndIsActive(dataMsg.customerId);
          console.log(`👷 [Worker] Chat ativo encontrado?`, hasActiveChat);

          if (!hasActiveChat) {
            console.log(`👷 [Worker] Nenhum chat ativo. Criando chat para customerId: ${dataMsg.customerId}`);
            const chat = await this.chatService.create(dataMsg.customerId);
            console.log(`👷 [Worker] Chat criado com id: ${chat.id}. Salvando mensagem do cliente...`);
            await this.messageService.createMessage(
              chat.id,
              dataMsg.msg,
              "CUSTOMER",
              dataMsg.type,
              dataMsg.mediaUrl ?? ""
            );

            console.log(`👷 [Worker] Enviando botões interativos para ${dataMsg.phone}...`);
            await sendInteractiveButtons(
              dataMsg.phone,
              `Seja bem vindo a rede Match! 🚀🔥\nPara te redirecionarmos melhor, qual é o motivo do contato?`,
              [
                { id: "pedido", title: "Realizar um pedido" },
                { id: "feedback", title: "Quero dar feedback" },
                { id: "problema", title: "Estou com problemas" }
              ]
            );
            console.log(`👷 [Worker] Salvando mensagem BOT no banco...`);
            await this.messageService.createMessage(
              chat.id,
              "Mensagem redirecionamento empresa",
              "BOT",
              "TEXT",
              ""
            );

            continue;
          }

          if (customerData?.role === "CUSTOMER") {
            const chatData = await this.chatService.findData(hasActiveChat.id);
            const handler = this.stepFactory.getHandler(chatData?.currentStep);
            console.log(`👷 [Worker] Roteando cliente para handler do step: ${chatData?.currentStep}`);
            await handler.handle(chatData, dataMsg);
          } else {
            const chatData = await this.chatService.findData(hasActiveChat.id);
            if (chatData?.currentStep !== Steps.attendant) {
              console.log(`👷 [Worker] Atualizando step do chat para 'attendant'`);
              await this.chatService.updateStep(hasActiveChat.id, Steps.attendant);
            }
            const handler = this.stepFactory.getHandler(Steps.attendant);
            console.log(`👷 [Worker] Roteando para handler do atendente`);
            await handler.handle(chatData, dataMsg);
          }

        } catch (error) {
          console.error("Erro ao processar mensagem sequencial:", error);
          await redisClient.del(idempotencyKey); // Permite reprocessamento se der crash

          // Devolve esta mensagem e todas as subsequentes para o INÍCIO da Inbox, preservando a ordem
          const remainingMessages = messages.slice(i);
          const remainingJson = remainingMessages.map(m => JSON.stringify(m));
          if (remainingJson.length > 0) {
            remainingJson.reverse();
            await redisClient.lpush(inboxKey, ...remainingJson);
          }

          throw error; // Repassa erro para a fila tentar novamente com backoff
        }
      }
    }
    } finally {
      await redisClient.del(lockKey);
      console.log(`🔓 [Worker] Lock liberado para customerId: ${customerId}`);
    }
  }
}
