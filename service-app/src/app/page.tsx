"use client";

import ChatCard from "@/components/chat/chatCard";
import { DialogFinish } from "@/components/chat/dialogFinish";
import { DialogNewChat } from "@/components/chat/dialogNewChat";
import MessageBubble from "@/components/chat/message";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { CustomerData } from "@/interface/Customers";
import { logoMap } from "@/lib/logoMap";
import { findCustomerChats } from "@/services/findCustomerChats";
import { getTickets } from "@/services/getTickets";
import { sendMessage } from "@/services/sendMessage";
import { ArrowLeft, Info, Send } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { io, Socket } from "socket.io-client";
import { ITicket } from "../interface/ITicket";

const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [tickets, setTickets] = useState<ITicket[]>([]);
  const [customerData, setCustomerData] = useState<CustomerData>();
  const [messageInput, setMessageInput] = useState("");

  const socketRef = useRef<Socket | null>(null);
  const ticketsRef = useRef<ITicket[]>([]);
  const selectedChatIdRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user.accessToken) return;

    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: {
        token: session.user.accessToken
      }
    });

    socketRef.current = socket;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleNewMessage = (payload: any) => {
      const message = payload.message ?? payload;
      const chatId = payload.chatId ?? message.chatId;

      setTickets(prev =>
        prev.map(ticket =>
          String(ticket.id) === String(chatId)
            ? {
                ...ticket,
                messages: [
                  ...ticket.messages,
                  {
                    id: message.id ?? `temp-${Date.now()}`,
                    content: message.content ?? "",
                    sender: message.sender ?? "CUSTOMER",
                    createdAt: message.createdAt ?? new Date().toISOString()
                  }
                ]
              }
            : ticket
        )
      );
    };

    const handleNewTicket = (ticket: ITicket) => {
      if (!ticketsRef.current.some(t => t.id === ticket.id)) {
        setTickets(prev => [...prev, ticket]);
      }
    };

    const handleTicketClosed = ({ ticketId }: { ticketId: string }) => {
      setTickets(prev => prev.filter(t => t.id !== ticketId));
      if (selectedChatIdRef.current === ticketId) {
        setSelectedChatId(null);
      }
    };

    socket.on("createMessage", handleNewMessage);
    socket.on("newTicket", handleNewTicket);
    socket.on("ticketClosed", handleTicketClosed);

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [status, session?.user.accessToken]);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user.accessToken) return;

    getTickets(session.user.accessToken)
      .then(res => res.data && setTickets(res.data))
      .catch(() => toast.error("Erro ao carregar tickets"));
  }, [status, session?.user.accessToken]);

  useEffect(() => {
    ticketsRef.current = tickets;
  }, [tickets]);

  useEffect(() => {
    selectedChatIdRef.current = selectedChatId;
  }, [selectedChatId]);

  const selectedChat = useMemo(
    () => tickets.find(t => t.id === selectedChatId) ?? null,
    [tickets, selectedChatId]
  );

  useEffect(() => {
    if (!selectedChat || !session?.user.accessToken) return;

    findCustomerChats(session.user.accessToken, selectedChat.customer.id)
      .then(res => setCustomerData(res.data))
      .catch(() => {});
  }, [selectedChat, session?.user.accessToken]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChat?.messages.length]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChat || !session?.user.accessToken)
      return;

    const text = messageInput;
    setMessageInput("");

    await sendMessage(
      selectedChat.id,
      text,
      selectedChat.customer.phone,
      session.user.accessToken
    );
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
            <DialogNewChat
              onChatCreated={setSelectedChatId}
              token={session?.user.accessToken ? session.user.accessToken : ""}
            />
            <Button className="text-sm bg-red-500 hover:bg-red-700">
              <Link href={"/dashboard"}>Dashboard</Link>
            </Button>
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
                <div className="flex gap-3">
                  <h2 className="font-bold text-lg">
                    {selectedChat.customer.name}
                  </h2>
                  <AlertDialog>
                    <AlertDialogTrigger>
                      <HoverCard>
                        <HoverCardTrigger>
                          <Info
                            color="gray"
                            size={25}
                            className="cursor-pointer"
                          />{" "}
                        </HoverCardTrigger>
                        <HoverCardContent>
                          Chats existentes: {customerData?.chats.length}
                          <br />
                          Problemas relatados:{" "}
                          {
                            customerData?.chats.filter(
                              chat => chat.contactReason === "problem"
                            ).length
                          }
                        </HoverCardContent>
                      </HoverCard>{" "}
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Chats do cliente
                          <p className="text-muted-foreground text-sm">
                            Chats existentes: {customerData?.chats.length}
                          </p>
                        </AlertDialogTitle>
                        <div className="h-[350px] overflow-y-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Empresa</TableHead>
                                <TableHead>Data</TableHead>
                                <TableHead>Chats</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {customerData?.chats
                                .filter(
                                  chat => chat.contactReason === "problem"
                                )
                                .map(chat => (
                                  <TableRow key={chat.id}>
                                    <TableCell className="font-medium">
                                      {chat.business.name}
                                    </TableCell>

                                    <TableCell>
                                      {new Date(
                                        chat.createdAt
                                      ).toLocaleDateString("pt-BR")}
                                    </TableCell>

                                    <TableCell>
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button
                                            variant="outline"
                                            className="cursor-pointer"
                                          >
                                            Visualizar
                                          </Button>
                                        </AlertDialogTrigger>

                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>
                                              Empresa {chat.business.name}
                                            </AlertDialogTitle>
                                          </AlertDialogHeader>

                                          <div className="flex flex-col max-h-[400px] overflow-y-auto my-3">
                                            {chat.messages.map(message => (
                                              <div
                                                key={message.id}
                                                className={`my-1 ${
                                                  message.sender === "CUSTOMER"
                                                    ? "self-start bg-amber-400 px-2 py-1 rounded-md"
                                                    : "self-end bg-amber-600 px-2 py-1 rounded-md"
                                                }`}
                                              >
                                                <p>{message.content}</p>
                                              </div>
                                            ))}
                                          </div>

                                          <AlertDialogFooter>
                                            <AlertDialogAction className="cursor-pointer">
                                              Voltar
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </div>
                        <AlertDialogDescription></AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogAction>Voltar</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <DialogFinish
                id={selectedChat.id}
                token={
                  session?.user.accessToken ? session.user.accessToken : ""
                }
              />
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
                  onKeyDown={e => e.key === "Enter" && handleSendMessage()}
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
