interface Response {
  id: string;
  ok: boolean;
}

export const startChat = async (
  token: string,
  customerPhone: string,
  contactReason: string,
  order: string,
  businessName: string,
  customerName: string
): Promise<Response> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/chat/attendant/start`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          customerPhone,
          contactReason,
          order,
          businessName,
          customerName
        })
      }
    );

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
