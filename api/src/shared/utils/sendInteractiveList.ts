import axios, { AxiosError } from "axios";
import "dotenv/config";
import { sendEmailInvalidToken } from "./sendEmail";
import { WhatsappErrorResponse } from "./sendTextMessage";

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

const API_URL = `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`;

export interface ListRow {
  id: string;
  title: string;
  description?: string;
}

export interface ListSection {
  title: string;
  rows: ListRow[];
}

export async function sendInteractiveList(
  phone: string,
  bodyText: string,
  buttonText: string,
  sections: ListSection[],
  headerText?: string
) {
  const payload: any = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: phone,
    type: "interactive",
    interactive: {
      type: "list",
      body: {
        text: bodyText
      },
      action: {
        button: buttonText,
        sections: sections.map((sec) => ({
          title: sec.title,
          rows: sec.rows.map((r) => ({
            id: r.id,
            title: r.title,
            ...(r.description ? { description: r.description } : {})
          }))
        }))
      }
    }
  };

  if (headerText) {
    payload.interactive.header = {
      type: "text",
      text: headerText
    };
  }

  const config = {
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json"
    }
  };

  try {
    await axios.post(API_URL, payload, config);
  } catch (error) {
    const axiosError = error as AxiosError<WhatsappErrorResponse>;
    const errorData = axiosError.response?.data;

    if (errorData?.error.code === 190) {
      const emails = [
        "gfefezinho@gmail.com",
        "edu.castro200@gmail.com",
        "contato.smatchburger@gmail.com",
        "contato.matchpizza@gmail.com",
        "contato.fihass@gmail.com"
      ];

      for (const email of emails) {
        await sendEmailInvalidToken(errorData.error, email);
      }
    }

    console.error(
      "Erro ao enviar mensagem interativa do tipo lista:",
      axiosError.response ? axiosError.response.data : axiosError.message
    );
  }
}
