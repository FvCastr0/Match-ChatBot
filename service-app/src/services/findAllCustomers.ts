import { Customers } from "@/interface/Customers";

interface Response {
  data?: Customers[];
  ok: boolean;
}

export const findAllCustomers = async (token: string): Promise<Response> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/customer/findAll`,
    {
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
    const data = await response.json().then(req => req);
    return {
      data,
      ok: true
    };
  }
};
