interface Response {
  ok: boolean;
  token: string;
  msg: string;
}

export const login = async (
  name: string,
  password: string
): Promise<Response> => {
  const response = await fetch(`http://localhost:3000/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: name,
      password
    })
  });

  const res = await response.json();

  if (!response.ok) {
    return {
      ok: false,
      token: "",
      msg: "Usuário ou senha inválidos"
    };
  } else {
    return {
      ok: true,
      token: res.access_token,
      msg: "Login efetuado com sucesso."
    };
  }
};
