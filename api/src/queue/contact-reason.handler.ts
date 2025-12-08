import { Injectable } from "@nestjs/common";
import { Chat, ContactReason } from "@prisma/client";
import { BusinessService } from "src/modules/business/business.service";
import { ChatService } from "src/modules/chat/chat.service";
import { MessageService } from "src/modules/message/message.service";
import { StepHandler } from "src/repositories/queue.repository";
import { detectCategory } from "src/shared/utils/detectCategory";
import { MessageData } from "src/shared/utils/processRecivedData";
import { sendMessageWithTemplate } from "src/shared/utils/sendMessageWithTemplate";
import { sendTextMessage } from "src/shared/utils/sendTextMessage";

@Injectable()
export class ContactReasonHandler implements StepHandler {
  private readonly intentKeywords = {
    order: [
      "quero fazer um pedido",
      "fazer pedido",
      "quero pedir",
      "fazer um pedido",
      "quero comprar",
      "fazer compra",
      "realizar pedido",
      "gostaria de pedir",
      "pedido",
      "pedir"
    ],

    feedback: [
      "dar um feedback",
      "quero dar feedback",
      "tenho um feedback",
      "quero avaliar",
      "quero deixar uma opinião",
      "sugestão",
      "reclamação",
      "elogio",
      "comentário"
    ],

    problem: [
      "estou tendo problemas",
      "estou com problema",
      "deu problema",
      "tive um problema",
      "algo deu errado",
      "não está funcionando",
      "erro",
      "bug",
      "falha",
      "preciso de ajuda",
      "ajuda"
    ]
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

    await this.messageService.createMessage(chat.id, dataMsg.msg, "CUSTOMER");

    const category = detectCategory(dataMsg.msg, this.intentKeywords);

    if (category === "order") {
      if (typeof chat.businessId !== "string") return;
      const business = await this.businessService.findById(chat.businessId);
      if (!business) {
        await sendTextMessage(
          dataMsg.phone,
          "Você deve selecionar uma das três opções acima."
        );
        await this.messageService.createMessage(
          chat.id,
          "Opção não selecionada",
          "BOT"
        );
        return;
      }

      if (business.name === "Match Pizza") {
        await sendMessageWithTemplate(dataMsg.phone, "place_order_pizza");
      } else if (business.name === "Smatch Burger") {
        await sendMessageWithTemplate(dataMsg.phone, "place_order_burger");
      } else if (business.name === "Fihass") {
        await sendMessageWithTemplate(dataMsg.phone, "place_order_fihass");
      } else {
        await sendTextMessage(
          dataMsg.phone,
          "Você deve selecionar uma das três opções acima."
        );
        await this.messageService.createMessage(
          chat.id,
          "Opção não selecionada",
          "BOT"
        );
      }

      await this.chatService.finishChat(chat.id);
      await this.chatService.updateContactReason(chat.id, ContactReason.order);
      return;
    }

    if (category === "feedback") {
      await sendTextMessage(
        dataMsg.phone,
        "Perfeito! Envie seu feedback por aqui mesmo!"
      );
      await this.messageService.createMessage(
        chat.id,
        "Perfeito! Envie seu feedback por aqui mesmo!",
        "BOT"
      );
      await this.chatService.finishChat(chat.id);
      await this.chatService.updateContactReason(
        chat.id,
        ContactReason.feedback
      );
      return;
    }

    await sendTextMessage(
      dataMsg.phone,
      "Você deve selecionar um dos três motivos para continuar seu atendimento."
    );
  }
}
