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
      "fazer pedido",
      "quero pedir",
      "fazer um pedido",
      "quero comprar",
      "fazer compra",
      "realizar pedido",
      "gostaria de pedir",
      "pedido",
      "pedir",
      "encomendar",
      "fazer uma encomenda",
      "encomenda"
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
      "ajuda",
      "problema",
      "defeito",
      "falha"
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

      if (business === null) {
        await sendTextMessage(dataMsg.phone, "Empresa não foi encontrada");

        await this.messageService.createMessage(
          chat.id,
          "Opção não selecionada",
          "BOT"
        );
        return;
      }

      if (business.name === "match_pizza") {
        await sendMessageWithTemplate(dataMsg.phone, "place_order_pizza");
      } else if (business.name === "smatch_burger") {
        await sendMessageWithTemplate(dataMsg.phone, "place_order_burger");
      } else if (business.name === "fihass") {
        await sendMessageWithTemplate(dataMsg.phone, "place_order_fihass");
      } else {
        await sendTextMessage(dataMsg.phone, "Problema ao encontrar empresa.");
        await this.messageService.createMessage(
          chat.id,
          "PROBLEMA INTERNO!!!",
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

    if (category === "problem") {
      await sendMessageWithTemplate(dataMsg.phone, "problem");
      await this.messageService.createMessage(
        chat.id,
        "Mensagem reportar problema",
        "BOT"
      );
      await this.chatService.updateContactReason(chat.id, "problem");
      await this.chatService.updateStep(chat.id, "attendant");
      return;
    }

    await sendTextMessage(
      dataMsg.phone,
      "Você deve selecionar um dos três motivos para continuar seu atendimento."
    );
  }
}
