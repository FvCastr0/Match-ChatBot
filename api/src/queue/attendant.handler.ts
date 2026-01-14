import { Injectable } from "@nestjs/common";
import { BusinessService } from "src/modules/business/business.service";
import { ChatService } from "src/modules/chat/chat.service";

import { Chat } from "@prisma/client";
import { MessageService } from "src/modules/message/message.service";
import { StepHandler } from "src/repositories/queue.repository";
import { MessageData } from "src/shared/utils/processRecivedData";

@Injectable()
export class AttendantHandler implements StepHandler {
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
    if (typeof dataMsg.mediaUrl === "string")
      await this.messageService.createMessage(
        chat.id,
        dataMsg.msg,
        "CUSTOMER",
        dataMsg.type,
        dataMsg.mediaUrl
      );
  }
}
