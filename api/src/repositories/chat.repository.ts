import { Chat, ContactReason, Steps } from "@prisma/client";

type ChatWithActiveAndId = Pick<Chat, "isActive" | "id">;

export abstract class ChatRepository {
  abstract findAndIsActive(
    customerId: string
  ): Promise<ChatWithActiveAndId | null>;
  abstract findData(chatId: string): Promise<Chat | null>;
  abstract create(customerId: string): Promise<Chat>;
  abstract updateStep(chaId: string, step: Steps): Promise<void>;
  abstract updateBusiness(chatId: string, businessName: string): Promise<void>;
  abstract finishChat(chatId: string): Promise<void>;
  abstract updateContactReason(
    id: string,
    contactReason: ContactReason
  ): Promise<void>;
}
