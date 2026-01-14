import { MessageType, SenderType } from "@prisma/client";

export interface MessageGroupResult {
  sender: string;
  createdAt: Date;
  _count: {
    _all: number;
  };
}

export abstract class MessageRepository {
  abstract createMessage(
    chatId: string,
    content: string,
    sender: SenderType,
    type: MessageType,
    mediaUrl: string
  ): any;

  abstract getQuantityOfMessages(): Promise<MessageGroupResult[]>;
}
