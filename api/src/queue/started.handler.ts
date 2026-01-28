import { Injectable } from "@nestjs/common";
import { BusinessService } from "src/modules/business/business.service";
import { ChatService } from "src/modules/chat/chat.service";

import { Chat } from "@prisma/client";
import { MessageService } from "src/modules/message/message.service";
import { StepHandler } from "src/repositories/queue.repository";
import { detectCategory } from "src/shared/utils/detectCategory";
import { MessageData } from "src/shared/utils/processRecivedData";
import { sendInteractiveButtons } from "src/shared/utils/sendInteractiveButtons";
import { sendTextMessage } from "src/shared/utils/sendTextMessage";

@Injectable()
export class StartedHandler implements StepHandler {
  private readonly companyKeywords = {
    smatch_burger: ["smatch", "burger", "hamburguer", "smatch burger"],
    match_pizza: ["match", "pizza", "pizzaria", "match pizza"],
    fihass: ["fihass", "esfirra", "esfiha", "fihas"]
  };
  constructor(
    private readonly chatService: ChatService,
    private readonly businessService: BusinessService,
    private readonly messageService: MessageService
  ) {}

  async handle(chat: Chat | null, dataMsg: MessageData): Promise<void> {
    if (!chat) {
      return;
    }

    const activeChat = await this.chatService.findAndIsActive(chat.customerId);
    if (activeChat?.status !== "open") return;

    await this.messageService.createMessage(
      chat.id,
      dataMsg.msg,
      "CUSTOMER",
      "TEXT",
      ""
    );
    const businessName = detectCategory(dataMsg.msg, this.companyKeywords);

    if (typeof businessName !== "string") return;
    const business = await this.businessService.findByName(businessName);

    if (!business) {
      await sendTextMessage(
        dataMsg.phone,
        "Você deve digitar o *nome da empresa* que você quer entrar em contato."
      );

      await this.messageService.createMessage(
        chat.id,
        "Opção não selecionada",
        "BOT",
        "TEXT",
        ""
      );
      return;
    }
    await sendInteractiveButtons(
      dataMsg.phone,
      `Perfeito! 😎
       Agora, preciso que você selecione abaixo um dos motivos de contato`,
      [
        { id: "pedido", title: "Quero fazer um pedido" },
        { id: "feedback", title: "Quero dar um feedback" },
        { id: "problema", title: "Estou tendo problemas" }
      ]
    );

    await this.messageService.createMessage(
      chat.id,
      "Mensagem motivo do contato",
      "BOT",
      "TEXT",
      ""
    );

    await this.chatService.updateStep(chat.id, "contact_reason");
    await this.chatService.updateBusiness(chat.id, business.name);
  }
}
