import { ITicket } from "../interface/ITicket";

interface Response {
  data?: ITicket[];
  ok: boolean;
}

export const getTickets = async (token: string): Promise<Response> => {
  const response = await fetch(`http://localhost:3000/chat/problems`, {
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
