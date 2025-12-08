import { Chat } from "@prisma/client";
import { MessageData } from "src/shared/utils/processRecivedData";

export abstract class StepHandler {
  abstract handle(chat: Chat | null, dataMsg: MessageData): Promise<void>;
}
