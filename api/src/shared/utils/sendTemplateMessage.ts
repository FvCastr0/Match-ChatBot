import axios, { AxiosError } from "axios";
import "dotenv/config";
import { sendEmailInvalidToken } from "./sendEmail";

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

const API_URL = `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`;

export interface WhatsappErrorResponse {
  error: {
    message: string;
    type: string;
    code: number;
    fbtrace_id: string;
  };
}

export async function sendTemplateMessage(
  phone: string,
  templateName: string,
  name: string,
  order: string
) {

  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: phone,
    type: "template",
    template: {
      name: templateName,
      language: {
        code: "pt_BR"
      },
      components: [
        {
          type: "body",
          parameters: [
            {
              type: "text",
              text: name
            },
            {
              type: "text",
              text: order
            }
          ]
        }
      ]
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
    }

    console.error(
      "Erro ao enviar template:",
      axiosError.response ? axiosError.response.data : axiosError.message
    );
  }
}
