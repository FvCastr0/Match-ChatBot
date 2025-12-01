"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import MessageBubble from "@/components/chat";
import ChatCard from "@/components/chatCard";
import { DialogFinish } from "@/components/chatCard/dialogFinish";
import { ScrollArea } from "@/components/ui/scroll-area";

type Ticket = {
  id: number;
  business: string;
  customerName: string;
  customerPhone: string;
  contactReason: string;
};

const logoMap: { [key: string]: string } = {
  "Match Pizza": "/imgs/logos/match.png",
  "Smatch Burger": "/imgs/logos/smatch.png",
  Fihass: "/imgs/logos/fihass.png"
};

const mockMessages = [
  {
    id: 1,
    text: "Boa tarde",
    timestamp: "14:35",
    isSender: true
  },
  {
    id: 2,
    text: "sim",
    timestamp: "14:46",
    isSender: false,
    senderName: "Cliente"
  },
  {
    id: 3,
    text: "como ce ta",
    timestamp: "14:57",
    isSender: true
  },
  {
    id: 4,
    text: "sei la mano",
    timestamp: "14:58",
    isSender: false,
    senderName: "Cliente"
  },
  { id: 5, text: "blz", timestamp: "14:59", isSender: true }
];

const mockTickets: Ticket[] = [
  {
    id: 1,
    business: "Match Pizza",
    customerName: "Fernando",
    customerPhone: "32991966510",
    contactReason: "Meu pedido veio errado."
  },
  {
    id: 2,
    business: "Smatch Burger",
    customerName: "Jorge",
    customerPhone: "32991966511",
    contactReason: "Atraso na entrega."
  },
  {
    id: 3,
    business: "Fihass",
    customerName: "Marcos",
    customerPhone: "32991966512",
    contactReason: "Item faltando."
  }
];

export default function Home() {
  const [selectedChat, setSelectedChat] = useState<Ticket | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 h-screen overflow-hidden">
      <ScrollArea
        className={`
          border-r-2 h-full overflow-y-auto bg-slate-50
          ${selectedChat ? "hidden" : "block"}
          md:block md:col-span-3
        `}
      >
        <div className="p-4 space-y-4">
          <h1 className="text-4xl text-slate-900 font-bold">Conversas</h1>
          {mockTickets.map(ticket => (
            <div key={ticket.id} onClick={() => setSelectedChat(ticket)}>
              <ChatCard
                business={ticket.business}
                customerName={ticket.customerName}
                customerPhone={ticket.customerPhone}
                contactReason={ticket.contactReason}
                isSelected={selectedChat?.id === ticket.id}
              />
            </div>
          ))}
        </div>
      </ScrollArea>
      <div
        className={`
          h-full flex flex-col bg-slate-100
          ${selectedChat ? "block" : "hidden"}
          md:block md:col-span-9
        `}
      >
        {selectedChat ? (
          <>
            <div className="p-4 border-b bg-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedChat(null)}
                  className="md:hidden"
                >
                  <ArrowLeft size={20} />
                </Button>

                {logoMap[selectedChat.business] && (
                  <Image
                    src={logoMap[selectedChat.business]}
                    alt={`${selectedChat.business} logo`}
                    width={40}
                    height={40}
                    className="rounded-lg"
                  />
                )}

                <h2 className="font-bold text-lg">
                  {selectedChat.customerName}
                </h2>
              </div>

              <div className="flex items-center">
                <DialogFinish />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex flex-col gap-3">
                {mockMessages.map(msg => (
                  <MessageBubble
                    key={msg.id}
                    text={msg.text}
                    timestamp={msg.timestamp}
                    isSender={msg.isSender}
                  />
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="h-full hidden md:flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Selecione uma conversa</h3>
              <p className="text-muted-foreground text-sm">
                Clique em uma conversa à esquerda para ver as mensagens.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
