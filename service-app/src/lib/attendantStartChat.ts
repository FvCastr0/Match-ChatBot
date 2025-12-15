interface Response {
  id: string;
  ok: boolean;
}

export const startChat = async (
  customerPhone: string,
  contactReason: string,
  message: string,
  businessName: string,
  customerName?: string
): Promise<Response> => {
  try {
    const response = await fetch(`http://localhost:3000/chat/attendant/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjYzlmMWJjMC01NDE3LTRiODMtOWQ0NC03OTI1NzA4ZWVjM2MiLCJpYXQiOjE3NjU2MzgzNzksImV4cCI6MTc2NjI0MzE3OX0.mau-ExbJHq-tSBnvQleHGJ2cUk8XYsZrcB_7jTpKN_A`
      },
      body: JSON.stringify({
        customerPhone,
        contactReason,
        message,
        businessName,
        customerName
      })
    });

    const ticket = await response.json();

    if (!response.ok) {
      console.error("Erro na resposta do servidor:", response);
      return { ok: false, id: "" };
    }

    return {
      id: ticket.id,
      ok: true
    };
  } catch (error) {
    console.error("Erro de conexão:", error);
    return { ok: false, id: "" };
  }
};
