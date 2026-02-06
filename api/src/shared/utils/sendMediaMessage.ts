import axios, { AxiosError } from "axios";
import FormData from "form-data";
import fs from "fs";
import { sendEmailInvalidToken } from "./sendEmail";

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

const API_URL = `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}`;

interface WhatsappErrorResponse {
    error: {
        message: string;
        type: string;
        code: number;
        fbtrace_id: string;
    };
}

async function uploadMedia(filePath: string): Promise<string> {
    const url = `${API_URL}/media`;
    const data = new FormData();
    data.append("messaging_product", "whatsapp");
    data.append("file", fs.createReadStream(filePath));

    const config = {
        headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            ...data.getHeaders(),
        },
    };

    try {
        const response = await axios.post(url, data, config);
        return response.data.id;
    } catch (error) {
        const axiosError = error as AxiosError<WhatsappErrorResponse>;
        console.error(
            "Erro ao fazer upload da mídia:",
            axiosError.response ? axiosError.response.data : axiosError.message
        );
        throw new Error("Falha no upload da mídia para o WhatsApp");
    }
}

export async function sendMediaMessage(phone: string, filePath: string) {
    try {
        const mediaId = await uploadMedia(filePath);

        const payload = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: phone,
            type: "image",
            image: {
                id: mediaId,
            },
        };

        const config = {
            headers: {
                Authorization: `Bearer ${ACCESS_TOKEN}`,
                "Content-Type": "application/json",
            },
        };

        await axios.post(`${API_URL}/messages`, payload, config);
    } catch (error) {
        const axiosError = error as AxiosError<WhatsappErrorResponse>;
        const errorData = axiosError.response?.data;

        if (errorData?.error.code === 190) {
            await sendEmailInvalidToken(errorData.error, "gfefezinho@gmail.com");
        }

        console.error(
            "Erro ao enviar mensagem de mídia:",
            axiosError.response ? axiosError.response.data : axiosError.message
        );
        throw error;
    }
}
