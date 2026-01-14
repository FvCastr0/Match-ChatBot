import axios, { AxiosError } from "axios";
import "dotenv/config";
import { sendEmailInvalidToken } from "./sendEmail";
import { WhatsappErrorResponse } from "./sendTextMessage";

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

const API_URL = `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`;

export async function sendMessageWithTemplate(phone: string, template: string) {
  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: phone,
    type: "template",
    template: {
      name: template,
      language: {
        code: "pt_BR"
      }
    }
  };

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
      await sendEmailInvalidToken(errorData.error, "gfefezinho@gmail.com");
      await sendEmailInvalidToken(errorData.error, "edu.castro200@gmail.com");
      await sendEmailInvalidToken(
        errorData.error,
        "contato.smatchburger@gmail.com"
      );
      await sendEmailInvalidToken(
        errorData.error,
        "contato.matchpizza@gmail.com"
      );
      await sendEmailInvalidToken(errorData.error, "contato.fihass@gmail.com");
    }

    console.error(
      "Erro ao enviar mensagem:",
      axiosError.response ? axiosError.response.data : axiosError.message
    );
  }
}
