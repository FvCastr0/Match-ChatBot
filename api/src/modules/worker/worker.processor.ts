import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { StepHandlerFactory } from "src/queue/step-handler-factory";
import { MessageData } from "src/shared/utils/processRecivedData";
import { sendTextMessage } from "src/shared/utils/sendTextMessage";
import { ChatService } from "../chat/chat.service";
import { CustomerService } from "../customer/customer.service";
import { MessageService } from "../message/message.service";

@Processor("message-queue")
export class WorkerProcessor extends WorkerHost {
  constructor(
    private readonly customerService: CustomerService,
    private readonly chatService: ChatService,
    private readonly messageService: MessageService,
    private readonly stepFactory: StepHandlerFactory
  ) {
    super();
  }

  override async process(job: Job<any>) {
    const dataMsg = job.data as MessageData;

    if (job.name !== "new-message") return;

    try {
      const customer = await this.customerService.findCustomer(
        dataMsg.customerId
      );

      if (!customer) {
        await this.customerService.createCustomer(
          dataMsg.customerId,
          dataMsg.name,
          dataMsg.phone
        );
      }

      const hasActiveChat = await this.chatService.findAndIsActive(
        dataMsg.customerId
      );

      if (!hasActiveChat) {
        const chat = await this.chatService.create(dataMsg.customerId);
        await this.messageService.createMessage(
          chat.id,
          dataMsg.msg,
          "CUSTOMER"
        );
        await sendTextMessage(dataMsg.phone, `*Seja Bem vindo a Rede Match!*
Para agilizar seu atendimento, com qual empresa você gostaria de falar? 
_(Match Pizza, Fihass, Smatch Burger)_
`);
        await this.messageService.createMessage(
          chat.id,
          "Mensagem redirecionamento empresa",
          "BOT"
        );
        return;
      }

      const chatData = await this.chatService.findData(hasActiveChat.id);
      const handler = this.stepFactory.getHandler(chatData?.currentStep);
      await handler.handle(chatData, dataMsg);
    } catch (error) {
      console.log(error);

      throw error;
    }
  }
}
