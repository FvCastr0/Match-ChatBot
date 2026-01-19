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

  if (value?.messages) {
    const message = value.messages[0];

    const messageData = async (): Promise<{
      msg: string;
      type: MessageType;
      mediaUrl?: string;
    }> => {
      if (message.type === "text") {
        return {
          msg: message.text.body,
          type: message.type.toUpperCase()
        };
      }

      if (message.type === "button") {
        return {
          msg: message.button.text,
          type: message.type.toUpperCase()
        };
      }

      if (message.type === "image") {
        let mediaUrl: string | undefined;

        if (process.env.ACCESS_TOKEN) {
          const saved = await saveMedia(
            message.image.url,
            process.env.ACCESS_TOKEN,
            message.image.id
          );

          if (saved) {
            mediaUrl = message.image.id + getExtension(message.image.mime_type);
          }
        }

        return {
          msg: message.image.caption ?? "",
          type: message.type.toUpperCase(),
          ...(mediaUrl && { mediaUrl })
        };
      }

      if (message.type === "video") {
        let mediaUrl: string | undefined;

        if (process.env.ACCESS_TOKEN) {
          const saved = await saveMedia(
            message.video.url,
            process.env.ACCESS_TOKEN,
            message.video.id
          );

          if (saved) {
            mediaUrl = message.video.id + getExtension(message.video.mime_type);
          }
        }

        return {
          msg: message.video.caption ?? "",
          type: "VIDEO",
          ...(mediaUrl && { mediaUrl })
        };
      }

      if (message.type === "audio") {
        let mediaUrl: string | undefined;

        if (process.env.ACCESS_TOKEN) {
          const saved = await saveMedia(
            message.audio.url,
            process.env.ACCESS_TOKEN,
            message.audio.id
          );

          if (saved) {
            mediaUrl = message.audio.id + getExtension(message.audio.mime_type);
          }
        }

        return {
          msg: "",
          type: "AUDIO",
          ...(mediaUrl && { mediaUrl })
        };
      }

      return {
        msg: "",
        type: "TEXT"
      };
    };

    function hasName() {
      if (value.contacts === undefined) {
        return "";
      } else {
        if (value.contacts[0].profile.name === "") return "";
        else return value.contacts[0].profile.name;
      }
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

  return null;
}
