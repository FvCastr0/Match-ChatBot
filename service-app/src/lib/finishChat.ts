interface Response {
  ok: boolean;
}

export const finishChat = async (
  id: string,
  token: string
): Promise<Response> => {
  const response = await fetch(`http://localhost:3000/chat/finish/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

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
