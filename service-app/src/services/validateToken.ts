interface Response {
  ok: boolean;
}

export const validateToken = async (token: string): Promise<Response> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/profile`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (response.status === 401 || response.status === 500) {
    return {
      ok: false
    };
  } else {
    return {
      ok: true
    };
  }
};
