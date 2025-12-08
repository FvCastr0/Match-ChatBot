import { Injectable } from "@nestjs/common";
import { SenderType } from "@prisma/client";
import { MessageRepository } from "src/repositories/message.repository";
import { PrismaService } from "src/shared/lib/prisma/prisma.service";

@Injectable()
export class MessageService extends MessageRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }
  async createMessage(chatId: string, content: string, sender: SenderType) {
    await this.prisma.message.create({
      data: {
        sender,
        content,
        chatId
      }
    });
  }
}
