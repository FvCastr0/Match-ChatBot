import { ITicket } from "@/interface/ITicket";

interface Response {
  data?: ITicket[];
  ok: boolean;
}

export const findAllChats = async (token: string): Promise<Response> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chat`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    return {
      ok: false
    };
  } else {
    const data = await response.json().then(req => req);
    return {
      data,
      ok: true
    };
  }
};
