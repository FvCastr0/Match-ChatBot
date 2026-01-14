import { MessageType } from "@prisma/client";
import { getExtension, saveMedia } from "./saveMedia";
import { sendTextMessage } from "./sendTextMessage";

export interface MessageData {
  customerId: string;
  phone: string;
  msg: string;
  timeLastMsg: number;
  name: string;
  type: MessageType;
  mediaType?: string;
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
      mediaType?: string;
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
          msg: "",
          type: message.type.toUpperCase(),
          mediaType: getExtension(message.image.mime_type),
          mediaUrl: message.image.id
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
          msg: "",
          type: message.type.toUpperCase(),
          mediaType: getExtension(message.image.mime_type),
          mediaUrl: message.video.id
        };
      }

      if (message.type === "audio") {
        sendTextMessage(
          message.from,
          "Nós não escutamos áudios, envie uma mensagem"
        );

        return {
          msg: "",
          type: "AUDIO"
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
      mediaType: parsedMessage.mediaType,
      mediaUrl: parsedMessage.mediaUrl
    };
  }

  return null;
}
