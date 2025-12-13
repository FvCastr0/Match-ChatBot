enum sender {
  CUSTOMER = "CUSTOMER",
  BOT = "BOT",
  attendant = "ATTENDANT"
}

export interface ITicket {
  business: { id: string; name: string };
  businessId: string;
  customerId: "1212857547420625";
  id: "cmj1kykh8000bxowfim0s01gy";
  customer: { id: string; name: string; phone: string };
  messages: {
    id: string;
    sender: sender;
    content: string;
    createdAt: Date;
  }[];
}
