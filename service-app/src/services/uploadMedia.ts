interface Response {
    filename?: string;
    ok: boolean;
}

export const uploadMedia = async (
    file: File,
    token: string
): Promise<Response> => {
    try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/media/upload`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            }
        );

        if (!response.ok) {
            console.error("Erro API Upload:", response.status, response.statusText);
            return { ok: false };
        }

        const data = await response.json();

        return {
            filename: data.filename,
            ok: true
        };
    } catch (error) {
        console.error("Erro de conexão no upload:", error);
        return { ok: false };
    }
};
