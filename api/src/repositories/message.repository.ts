import { SenderType } from "@prisma/client";

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
    sender: SenderType
  ): any;

  abstract getQuantityOfMessages(): Promise<MessageGroupResult[]>;
}
