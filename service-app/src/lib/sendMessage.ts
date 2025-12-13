import { ITicket } from "../interface/ITicket";

interface Response {
  data?: ITicket[];
  ok: boolean;
}

export const sendMessage = async (
  chatId: string,
  message: string,
  phone: string
): Promise<Response> => {
  try {
    const response = await fetch(`http://localhost:3000/message/attendant`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjYzlmMWJjMC01NDE3LTRiODMtOWQ0NC03OTI1NzA4ZWVjM2MiLCJpYXQiOjE3NjU2MzgzNzksImV4cCI6MTc2NjI0MzE3OX0.mau-ExbJHq-tSBnvQleHGJ2cUk8XYsZrcB_7jTpKN_A`
      },
      body: JSON.stringify({
        chatId,
        content: message,
        phone
      })
    });

    if (!response.ok) {
      console.error("Erro API:", response.status, response.statusText);
      return { ok: false };
    }

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    return {
      data,
      ok: true
    };
  } catch (error) {
    console.error("Erro de conexão:", error);
    return { ok: false };
  }
};
