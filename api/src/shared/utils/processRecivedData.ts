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
}

export async function ProcessRecivedData(
  data: any
): Promise<MessageData | null> {
  const changes = data.entry?.[0]?.changes?.[0];
  const value = changes?.value;

  if (!value?.messages) return null;

  const message = value.messages[0];

  const triggerSaveMedia = (url: string, id: string) => {
    if (process.env.ACCESS_TOKEN) {
      saveMedia(url, process.env.ACCESS_TOKEN, id).catch(err => {
        console.error(`Erro ao salvar media em background (ID: ${id}):`, err);
      });
    }
  };

  async function messageData(): Promise<{
    msg: string;
    type: MessageType;
    mediaUrl?: string;
  }> {
    if (message.type === "text") {
      return {
        msg: message.text.body,
        type: message.type.toUpperCase() as MessageType
      };
    }

    if (message.type === "button") {
      return {
        msg: message.button.text,
        type: message.type.toUpperCase() as MessageType
      };
    }

    if (message.type === "image") {
      const extension = getExtension(message.image.mime_type);
      const mediaUrl = message.image.id + extension;

      triggerSaveMedia(message.image.url, message.image.id);

      return {
        msg: message.image.caption ?? "",
        type: message.type.toUpperCase() as MessageType,
        mediaUrl: mediaUrl
      };
    }

    if (message.type === "video") {
      const extension = getExtension(message.video.mime_type);
      const mediaUrl = message.video.id + extension;

      triggerSaveMedia(message.video.url, message.video.id);

      return {
        msg: message.video.caption ?? "",
        type: "VIDEO",
        mediaUrl: mediaUrl
      };
    }

    if (message.type === "audio") {
      const extension = getExtension(message.audio.mime_type);
      const mediaUrl = message.audio.id + extension;

      triggerSaveMedia(message.audio.url, message.audio.id);

      return {
        msg: "",
        type: "AUDIO",
        mediaUrl: mediaUrl
      };
    }

    return {
      msg: "",
      type: "TEXT"
    };
  }

  function hasName(): string {
    return value.contacts?.[0]?.profile?.name ?? "";
  }

  const parsedMessage = await messageData();

  return {
    customerId: message.from,
    phone: message.from,
    msg: parsedMessage.msg,
    name: hasName(),
    timeLastMsg: Number(message.timestamp),
    type: parsedMessage.type,
    mediaUrl: parsedMessage.mediaUrl
  };
}
