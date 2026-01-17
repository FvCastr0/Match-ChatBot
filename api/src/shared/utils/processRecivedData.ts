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

export function ProcessRecivedData(data: any): MessageData | null {
  const changes = data.entry?.[0]?.changes?.[0];
  const value = changes?.value;

  if (value?.messages) {
    const message = value.messages[0];

    const messageData = (): {
      msg: string;
      type: MessageType;
      mediaUrl?: string;
    } => {
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
        if (process.env.ACCESS_TOKEN) {
          saveMedia(
            message.image.url,
            process.env.ACCESS_TOKEN,
            message.image.id
          );
        }

        return {
          msg: message.image.caption,
          type: message.type.toUpperCase(),
          mediaUrl: message.image.id + getExtension(message.image.mime_type)
        };
      }

      if (message.type === "video") {
        if (process.env.ACCESS_TOKEN) {
          saveMedia(
            message.video.url,
            process.env.ACCESS_TOKEN,
            message.video.id
          );
        }

        return {
          msg: message.video.caption,
          type: message.type.toUpperCase(),
          mediaUrl: message.video.id + getExtension(message.video.mime_type)
        };
      }

      if (message.type === "audio") {
        if (process.env.ACCESS_TOKEN) {
          saveMedia(
            message.audio.url,
            process.env.ACCESS_TOKEN,
            message.audio.id
          );
        }

        return {
          msg: "",
          type: "AUDIO",
          mediaUrl: message.audio.id + getExtension(message.audio.mime_type)
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

    const parsedMessage = messageData();

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
