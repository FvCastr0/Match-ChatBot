interface Response {
  ok: boolean;
}

export const validateToken = async (token: string): Promise<Response> => {
  const baseUrl = process.env.INTERNAL_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
  const response = await fetch(
    `${baseUrl}/auth/profile`,
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
