import { SenderType } from "@prisma/client";

export abstract class MessageRepository {
  abstract createMessage(
    chatId: string,
    content: string,
    sender: SenderType
  ): any;
}
