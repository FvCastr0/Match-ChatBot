import { Processor, WorkerHost } from "@nestjs/bullmq"; // Importe WorkerHost!
import { Steps } from "@prisma/client";
import { Job } from "bullmq";
import { MessageData } from "src/shared/utils/processRecivedData";
import { sendMessage } from "src/shared/utils/sendMessage";
import { ChatService } from "../chat/chat.service";
import { CustomerService } from "../customer/customer.service";

@Processor("message-queue")
export class WorkerProcessor extends WorkerHost {
  constructor(
    private readonly customerService: CustomerService,
    private readonly chatService: ChatService
  ) {
    super();
  }

  override async process(job: Job<any>) {
    const dataMsg = job.data as MessageData;

    if (job.name !== "new-message") {
      return;
    }

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

      const hasActiveChat = await this.chatService.findChatAndIsActive(
        dataMsg.customerId
      );

      const getMessageInfo = (): { step: string; place: string } => {
        if (dataMsg.msg === "Match Pizza")
          return { step: Steps.place_order_pizza, place: "Match Pizza" };
        if (dataMsg.msg === "Smatch Burger")
          return { step: Steps.place_order_burger, place: "Smatch Burger" };
        if (dataMsg.msg === "Fihass")
          return { step: Steps.place_order_fihass, place: "Fihass" };

        return { step: "", place: "" };
      };

      if (hasActiveChat) {
        const chatData = await this.chatService.findChatData(hasActiveChat.id);

        switch (chatData?.currentStep) {
          case "started":
            sendMessage(dataMsg.phone, "contact");
            this.chatService.updateChatStep(hasActiveChat.id, "contact_reason");
            break;
        }
      } else {
        await this.chatService.createChat(dataMsg.customerId);
        await sendMessage(dataMsg.phone, "business_redirect");
      }

      console.log(`Job ${job.id} processado com sucesso.`);
    } catch (error) {
      console.error(`Falha ao processar job ${job.id}:`, error);
      throw error;
    }
  }
}
