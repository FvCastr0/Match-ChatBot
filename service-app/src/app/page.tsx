/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import ChatCard from "@/components/chat/chatCard";
import { DialogFinish } from "@/components/chat/dialogFinish";
import { DialogNewChat } from "@/components/chat/dialogNewChat";
import MessageBubble from "@/components/chat/message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getProblemsData } from "@/lib/getProblemsData";
import { logoMap } from "@/lib/logoMap";
import { sendMessage } from "@/lib/sendMessage";
import { ArrowLeft, Send } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import { ITicket } from "../interface/ITicket";

const SOCKET_URL = "http://localhost:3000";

export default function Home() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [tickets, setTickets] = useState<Array<ITicket>>([]);
  const [messageInput, setMessageInput] = useState<string>("");
  const socket = useMemo(
    () =>
      io(SOCKET_URL, {
        reconnection: false
      }),
    []
  );

  const ticketsRef = useRef<Array<ITicket>>([]);
  const selectedChatIdRef = useRef<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const selectedChat = useMemo(
    () => tickets.find(t => t.id === selectedChatId) || null,
    [tickets, selectedChatId]
  );

  // Keep ticketsRef updated
  useEffect(() => {
    ticketsRef.current = tickets;
  }, [tickets]);

  // Keep selectedChatIdRef updated
  useEffect(() => {
    selectedChatIdRef.current = selectedChatId;
  }, [selectedChatId]);

  // Scroll to bottom
  useEffect(() => {
    if (selectedChat) {
      scrollToBottom();
    }
  }, [selectedChat?.messages.length, selectedChat]);

  // Fetch tickets data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getProblemsData();
        if (data.data) setTickets(data.data);
      } catch (e) {
        toast.error("Erro ao carregar data");
      }
    };
    fetchData();
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (socket) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handleNewMessage = (payload: any) => {
        const rawMessage = payload.message || payload;
        const targetChatId = payload.chatId || rawMessage.chatId;

        setTickets(prevTickets => {
          return prevTickets.map(ticket => {
            if (String(ticket.id) === String(targetChatId)) {
              const newMessage = {
                id: rawMessage.id || `temp-${Date.now()}`,
                content: rawMessage.content || rawMessage.body || "",
                sender: rawMessage.sender || "CUSTOMER",
                createdAt: rawMessage.createdAt || new Date().toISOString()
              };

              return {
                ...ticket,
                messages: [...ticket.messages, newMessage],
                updatedAt: new Date().toISOString()
              };
            }
            return ticket;
          });
        });
      };

      const handleTicketClosed = (payload: { ticketId: string }) => {
        setTickets(prevTickets => {
          return prevTickets.filter(t => t.id !== payload.ticketId);
        });

        if (selectedChatIdRef.current === payload.ticketId) {
          setSelectedChatId(null);
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handleNewTicket = (payload: any) => {
        const chatExists = ticketsRef.current.some(
          ticket => ticket.id === payload.id
        );
        if (!chatExists) {
          setTickets(prevTickets => [...prevTickets, payload]);
        }
      };

      socket.on("newTicket", handleNewTicket);
      socket.on("createMessage", handleNewMessage);
      socket.on("ticketClosed", handleTicketClosed);
      return () => {
        socket.off("newTicket", handleNewTicket);
        socket.off("createMessage", handleNewMessage);
        socket.off("ticketClosed", handleTicketClosed);
      };
    }
  }, [socket, setTickets]);

  const handleChatCreated = (newTicket: string) => {
    setSelectedChatId(newTicket);
  };

  const handleSendMessage = async () => {
    setMessageInput("");

    await sendMessage(
      selectedChatId!,
      messageInput,
      selectedChat!.customer.phone
    );
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && messageInput.trim() !== "") {
      handleSendMessage();
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 h-screen">
      <ScrollArea
        className={`border-r-2 h-full bg-slate-50 ${
          selectedChatId ? "hidden" : "block"
        } md:block md:col-span-3 overflow-y-auto`}
      >
        <div className="p-4 space-y-1">
          <div className="flex items-center justify-between mb-6">
            <DialogNewChat onChatCreated={handleChatCreated} />
            <p className="text-md space-y-4 text-gray-700 font-medium ">
              {tickets.length} tickets abertos
            </p>
          </div>
          {tickets.map(ticket => (
            <div key={ticket.id} onClick={() => setSelectedChatId(ticket.id)}>
              <ChatCard
                business={ticket.business.name}
                customerName={ticket.customer.name}
                customerPhone={ticket.customer.phone}
                contactReason={
                  ticket.messages.at(-1)?.content || "Sem mensagens"
                }
                isSelected={selectedChatId === ticket.id}
              />
            </div>
          ))}
        </div>
      </ScrollArea>

      <div
        className={`h-full flex flex-col bg-slate-100 ${
          selectedChatId ? "block" : "hidden"
        } md:block md:col-span-9`}
      >
        {selectedChat ? (
          <>
            <div className="p-4 border-b bg-white flex justify-between items-center overflow-y-auto h-[77px]">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedChatId(null)}
                  className="md:hidden"
                >
                  <ArrowLeft size={20} />
                </Button>

                {logoMap[selectedChat.business.name] && (
                  <Image
                    src={logoMap[selectedChat.business.name]}
                    alt="Logo"
                    width={40}
                    height={40}
                    className="rounded-lg"
                    style={{ width: "auto", height: "auto" }}
                  />
                )}

                <h2 className="font-bold text-lg">
                  {selectedChat.customer.name}
                </h2>
              </div>
              <DialogFinish id={selectedChat.id} />
            </div>

            <ScrollArea className="h-[calc(100vh-148px)]">
              <div className="flex-1 p-4 ">
                <div className="flex flex-col gap-3">
                  {selectedChat.messages
                    .filter(message => message && message.content)
                    .map((message, index) => (
                      <MessageBubble
                        key={index}
                        isSender={message.sender !== "CUSTOMER"}
                        text={message.content}
                        createdAt={new Date(
                          message.createdAt
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      />
                    ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            </ScrollArea>

            <div className="p-4 bg-white border-t h-[69px] ">
              <div className="flex items-center gap-2 w-full">
                <Input
                  placeholder="Digite uma mensagem"
                  onSubmit={handleSendMessage}
                  value={messageInput}
                  onChange={e => setMessageInput(e.target.value)}
                  onKeyUp={handleKeyUp}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="cursor-pointer"
                  onClick={handleSendMessage}
                >
                  <Send color="#1C398E" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full hidden md:flex items-center justify-center">
            <h3 className="text-lg font-semibold">Selecione uma conversa</h3>
          </div>
        )}
      </div>
    </div>
  );
}
