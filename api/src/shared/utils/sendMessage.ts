import axios, { AxiosError } from "axios";
import "dotenv/config";

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

const API_URL = `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`;

export async function sendMessage(phone: number, template: string) {
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
    const axiosError = error as AxiosError;
    console.error(
      "Erro ao enviar mensagem:",
      axiosError.response ? axiosError.response.data : axiosError.message
    );
  }
}
