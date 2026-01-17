import { ITicket } from "./ITicket";

export interface Customers {
  name: string;
  phone: string;
  id: string;
  chats: ITicket[];
}

export interface CustomerData {
  id: string;
  name: string;
  phone: string;
  chats: [
    {
      business: {
        name: string;
      };
      id: string;
      contactReason: string;
      createdAt: string;
      messages: [
        {
          createdAt: string | number | Date;
          type: string;
          mediaUrl: string;
          content: string;
          sender: string;
          id: string;
        }
      ];
    }
  ];
}
