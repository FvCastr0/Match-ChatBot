interface Response {
  ok: boolean;
}

export const finishChat = async (id: string): Promise<Response> => {
  const response = await fetch(`http://localhost:3000/chat/finish/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjYzlmMWJjMC01NDE3LTRiODMtOWQ0NC03OTI1NzA4ZWVjM2MiLCJpYXQiOjE3NjU2MzgzNzksImV4cCI6MTc2NjI0MzE3OX0.mau-ExbJHq-tSBnvQleHGJ2cUk8XYsZrcB_7jTpKN_A`
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
