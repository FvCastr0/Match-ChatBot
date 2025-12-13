import { Injectable } from "@nestjs/common";
import { SenderType } from "@prisma/client";
import { MessageRepository } from "src/repositories/message.repository";
import { PrismaService } from "src/shared/lib/prisma/prisma.service";
import { ChatGateway } from "../chat/chat.gateway";

@Injectable()
export class MessageService extends MessageRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly chatGateway: ChatGateway
  ) {
    super();
  }
  async createMessage(chatId: string, content: string, sender: SenderType) {
    const newMessage = await this.prisma.message.create({
      data: {
        sender,
        content,
        chatId
      }
    });
    this.chatGateway.notifyNewMessage(newMessage);
  }
}
