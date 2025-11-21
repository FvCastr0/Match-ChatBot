import axios, { AxiosError } from "axios";

const ACCESS_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

const API_URL = `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`;

export async function sendMessage() {
  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: "553291966510",
    type: "template",
    template: {
      name: "hello_world",
      language: {
        code: "en_US"
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
