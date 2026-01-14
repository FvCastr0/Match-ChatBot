export enum sender {
  CUSTOMER = "CUSTOMER",
  BOT = "BOT",
  AGENT = "AGENT"
}

export interface ITicket {
  business: { id: string; name: string };
  businessId: string;
  customerId: string;
  id: string;
  closedAt: Date;
  createdAt: Date;
  contactReason: string;
  currentStep: string;
  startedBy: string;
  status: string;
  customer: { id: string; name: string; phone: string };
  messages: {
    id: string;
    sender: sender;
    content: string;
    createdAt: Date;
    mediaUrl: string;
    type: string;
  }[];
}
