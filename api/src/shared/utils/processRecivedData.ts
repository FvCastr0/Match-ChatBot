import { MessageType } from "@prisma/client";
import { getExtension, saveMedia } from "./saveMedia";

export interface MessageData {
  customerId: string;
  phone: string;
  msg: string;
  timeLastMsg: number;
  name: string;
  type: MessageType;
  mediaUrl?: string;
  downloadUrl?: string;
  mediaId?: string;
}

export function ProcessRecivedData(data: any): MessageData | null {
  const changes = data.entry?.[0]?.changes?.[0];
  const value = changes?.value;

  if (!value?.messages?.length) {
    return null;
  }

  if (value?.messages) {
    const message = value.messages[0];

    const messageData = (): {
      msg: string;
      type: MessageType;
      mediaUrl?: string;
      downloadUrl?: string;
      mediaId?: string;
    } => {
      if (message.type === "text") {
        return {
          msg: message.text.body,
          type: message.type.toUpperCase() as MessageType
        };
      }

      if (message.type === "interactive") {
        return {
          msg: message.interactive.button_reply.id,
          type: "TEXT" as MessageType
        };
      }

      if (message.type === "button") {
        return {
          msg: message.button.text,
          type: message.type.toUpperCase() as MessageType
        };
      }

      if (message.type === "image") {
        return {
          msg: message.image.caption ?? "",
          type: message.type.toUpperCase() as MessageType,
          mediaUrl: message.image.id + getExtension(message.image.mime_type),
          downloadUrl: message.image.url,
          mediaId: message.image.id
        };
      }

      if (message.type === "video") {
        return {
          msg: message.video.caption ?? "",
          type: "VIDEO",
          mediaUrl: message.video.id + getExtension(message.video.mime_type),
          downloadUrl: message.video.url,
          mediaId: message.video.id
        };
      }

      if (message.type === "audio") {
        return {
          msg: "",
          type: "AUDIO",
          mediaUrl: message.audio.id + getExtension(message.audio.mime_type),
          downloadUrl: message.audio.url,
          mediaId: message.audio.id
        };
      }

      return { msg: "", type: "TEXT" };
    };

    function hasName(): string {
      const name = value?.contacts?.[0]?.profile?.name;

      if (typeof name !== "string") return "";
      return name.trim();
    }

    const parsedMessage = messageData();

    return {
      customerId: message.from,
      phone: message.from,
      msg: parsedMessage.msg,
      name: hasName(),
      timeLastMsg: Number(message.timestamp),
      type: parsedMessage.type,
      mediaUrl: parsedMessage.mediaUrl,
      downloadUrl: parsedMessage.downloadUrl,
      mediaId: parsedMessage.mediaId
    };
  }
  return null;
}
