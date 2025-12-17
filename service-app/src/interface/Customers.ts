import { ITicket } from "./ITicket";

export interface Customers {
  name: string;
  phone: string;
  id: string;
  chats: ITicket[];
}
