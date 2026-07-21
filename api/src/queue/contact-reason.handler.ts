import { Injectable } from "@nestjs/common";
import { Chat, ContactReason } from "@prisma/client";
import { ChatService } from "src/modules/chat/chat.service";
import { MessageService } from "src/modules/message/message.service";
import { StepHandler } from "src/repositories/queue.repository";
import { detectCategory } from "src/shared/utils/detectCategory";
import { MessageData } from "src/shared/utils/processRecivedData";
import { sendInteractiveButtons } from "src/shared/utils/sendInteractiveButtons";
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
      "comentário",
      "feedback"
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
    private readonly messageService: MessageService
  ) { }

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

    const category = detectCategory(dataMsg.msg, this.intentKeywords);

    if (category === "order") {
      await sendTextMessage(
        dataMsg.phone,
        `*Boa escolha!* 🍕🍔🐪
Acesse nosso site para montar seu pedido: http://localhost:5173/`
      );

      await this.chatService.finishChat(chat.id);
      await this.chatService.updateContactReason(chat.id, ContactReason.order);
      return;
    }

    if (category === "feedback") {
      await sendTextMessage(
        dataMsg.phone,
        `*Perfeito!*
Acesse nosso site e avalie *sua experiência*: http://localhost:5173/feedback`
      );
      await this.messageService.createMessage(
        chat.id,
        "Perfeito! Envie seu feedback por aqui mesmo!",
        "BOT",
        "TEXT",
        ""
      );
      await this.chatService.finishChat(chat.id);
      await this.chatService.updateContactReason(
        chat.id,
        ContactReason.feedback
      );
      return;
    }

    if (category === "problem") {
      await sendInteractiveButtons(
        dataMsg.phone,
        `Entendido!
Agora, selecione com qual empresa você está tendo problemas`,
        [
          { id: "Match Pizza", title: "🍕 Match Pizza" },
          { id: "Smatch burger", title: "🍔 Smatch Burger" },
          { id: "Fihass", title: "🐪 Fihass" }
        ]
      );
      await this.messageService.createMessage(
        chat.id,
        "Qual problema você está tendo?",
        "BOT",
        "TEXT",
        ""
      );
      await this.chatService.updateContactReason(chat.id, "problem");
      await this.chatService.updateStep(chat.id, "business_redirect");
      return;
    }

    await sendTextMessage(
      dataMsg.phone,
      "Para continuar o seu atendimento, digite por qual motivo você entrou em contato. (Problema, Fazer um pedido ou Feedback)"
    );
  }
}
