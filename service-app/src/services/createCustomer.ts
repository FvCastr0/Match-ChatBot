export const createCustomer = async (
    token: string,
    data: { name: string; phone: string; role?: string }
) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/customer/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            return { ok: true };
        } else {
            return { ok: false };
        }
    } catch (e) {
        return { ok: false };
    }
};
