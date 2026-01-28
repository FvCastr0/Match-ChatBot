import { Injectable } from "@nestjs/common";
import { BusinessService } from "src/modules/business/business.service";
import { ChatService } from "src/modules/chat/chat.service";

import { Chat } from "@prisma/client";
import { ChatGateway } from "src/modules/chat/chat.gateway";
import { MessageService } from "src/modules/message/message.service";
import { StepHandler } from "src/repositories/queue.repository";
import { detectCategory } from "src/shared/utils/detectCategory";
import { MessageData } from "src/shared/utils/processRecivedData";
import { sendTextMessage } from "src/shared/utils/sendTextMessage";

@Injectable()
export class BusinessRedirectHandler implements StepHandler {
  private readonly companyKeywords = {
    smatch_burger: ["smatch", "burger", "hamburguer", "smatch burger"],
    match_pizza: ["match", "pizza", "pizzaria", "match pizza"],
    fihass: ["fihass", "esfirra", "esfiha", "fihas"]
  };
  constructor(
    private readonly chatService: ChatService,
    private readonly businessService: BusinessService,
    private readonly chatGateway: ChatGateway,
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
    await sendTextMessage(
      dataMsg.phone,
      `Entendemos sua frustração e vamos buscar resolver da melhor forma 🚀
Explique de forma *breve* o que está acontecendo para haver um melhor redirecionamento.`
    );

    await this.messageService.createMessage(
      chat.id,
      "Mensagem motivo do contato",
      "BOT",
      "TEXT",
      ""
    );

    await this.chatService.updateStep(chat.id, "attendant");
    await this.chatService.updateBusiness(chat.id, business.name);

    const chatPayload = await this.chatService.getChatPayload(chat.id);

    this.chatGateway.emitNewTicket(chatPayload);
  }
}
