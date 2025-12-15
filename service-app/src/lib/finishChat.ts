interface Response {
  ok: boolean;
}

export const finishChat = async (
  id: string,
  token: string
): Promise<Response> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/chat/finish/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    return {
      ok: false
    };
  } else {
    return {
      ok: true
    };
  }
};
