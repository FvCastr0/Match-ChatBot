interface Response {
    ok: boolean;
}

export const sendMediaMessage = async (
    chatId: string,
    phone: string,
    filename: string,
    token: string,
    caption?: string
): Promise<Response> => {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/message/attendant/media`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    chatId,
                    phone,
                    filename,
                    caption
                })
            }
        );

        if (!response.ok) {
            console.error("Erro API Send Media:", response.status, response.statusText);
            return { ok: false };
        }

        return {
            ok: true
        };
    } catch (error) {
        console.error("Erro de conexão ao enviar mídia:", error);
        return { ok: false };
    }
};
