import { Processor, WorkerHost } from "@nestjs/bullmq"; // Importe WorkerHost!
import { Chat, ContactReason, Steps } from "@prisma/client";
import { Job } from "bullmq";
import { MessageData } from "src/shared/utils/processRecivedData";
import { sendTextMessage } from "src/shared/utils/sendMessage";
import { sendMessageWithTemplate } from "src/shared/utils/sendMessageWithTemplate";
import { BusinessService } from "../business/business.service";
import { ChatService } from "../chat/chat.service";
import { CustomerService } from "../customer/customer.service";

@Processor("message-queue")
export class WorkerProcessor extends WorkerHost {
  constructor(
    private readonly customerService: CustomerService,
    private readonly chatService: ChatService,
    private readonly businessService: BusinessService
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

      const getMessageInfoBusiness = (): { step: string; place: string } => {
        switch (dataMsg.msg) {
          case "Match Pizza":
            return { step: Steps.place_order_pizza, place: "Match Pizza" };
          case "Smatch Burger":
            return { step: Steps.place_order_pizza, place: "Smatch Burger" };
          case "Fihass":
            return { step: Steps.place_order_pizza, place: "Fihass" };
          default:
            return { step: "", place: "" };
        }
      };

      const getMessageInfoReason = async (chatData: Chat) => {
        if (!chatData.businessId) return null;

        const businessName = await this.businessService.findBusinessById(
          chatData.businessId
        );

        if (hasActiveChat)
          switch (dataMsg.msg) {
            case "Quero fazer um pedido":
              if (businessName?.name === "Match Pizza") {
                sendMessageWithTemplate(dataMsg.phone, "place_order_pizza");
                await this.chatService.updateChatActive(chatData.id, false);
                await this.chatService.updateContactReason(
                  chatData.id,
                  ContactReason.order
                );

                await this.chatService.updateChatStep(
                  hasActiveChat.id,
                  "finished"
                );
                return;
              }
              if (businessName?.name === "Smatch Burger") {
                sendMessageWithTemplate(dataMsg.phone, "place_order_burger");
                await this.chatService.updateChatActive(chatData.id, false);

                await this.chatService.updateContactReason(
                  chatData.id,
                  ContactReason.order
                );

                await this.chatService.updateChatStep(
                  hasActiveChat.id,
                  "finished"
                );
                return;
              }
              if (businessName?.name === "Fihass") {
                sendMessageWithTemplate(dataMsg.phone, "place_order_fihass");
                await this.chatService.updateChatActive(chatData.id, false);
                await this.chatService.updateContactReason(
                  chatData.id,
                  ContactReason.order
                );
                await this.chatService.updateChatStep(
                  hasActiveChat.id,
                  "finished"
                );
                return;
              }
              break;
            case "Estou tendo problemas":
              break;
            case "Quero dar um feedback":
              sendTextMessage(
                dataMsg.phone,
                "Perfeito! Envie seu feedback por aqui mesmo!"
              );
              break;
            default:
              sendTextMessage(
                dataMsg.phone,
                "Você deve selecionar um dos três motivos para continuar seu atendimento."
              );
              return { step: "", place: "" };
          }
      };

      if (hasActiveChat) {
        const chatData = await this.chatService.findChatData(hasActiveChat.id);

        switch (chatData?.currentStep) {
          case "started":
            if (
              getMessageInfoBusiness().place === "" ||
              getMessageInfoBusiness().step === ""
            ) {
              sendTextMessage(
                dataMsg.phone,
                "Você deve selecionar uma das três empresas ou digitar o nome delas."
              );
            } else {
              sendMessageWithTemplate(dataMsg.phone, "contact");
              this.chatService.updateChatStep(
                hasActiveChat.id,
                "contact_reason"
              );
              this.chatService.updateBusinessChat(
                hasActiveChat.id,
                getMessageInfoBusiness().place
              );
            }
            break;
          case "contact_reason":
            await getMessageInfoReason(chatData);
            break;
        }
      } else {
        await this.chatService.createChat(dataMsg.customerId);
        await sendMessageWithTemplate(dataMsg.phone, "business_redirect");
      }

      console.log(`Job ${job.id} processado com sucesso.`);
    } catch (error) {
      console.error(`Falha ao processar job ${job.id}:`, error);
      throw error;
    }
  }
}
