import { CustomerData } from "@/interface/Customers";

interface Response {
  data?: CustomerData;
  ok: boolean;
}

export const findCustomerChats = async (
  token: string,
  customerId: string
): Promise<Response> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/customer/${customerId}`,
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
