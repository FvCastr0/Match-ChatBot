"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { startChat } from "@/services/attendantStartChat";
import { AlertDialogTitle } from "@radix-ui/react-alert-dialog";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "react-toastify";
import { Input } from "../ui/input";

enum Business {
  Fihass = "fihass",
  Smatch = "smatch_burger",
  Match = "match_pizza"
}

const mockReasons = [
  {
    value: "problem",
    label: "Problema"
  },
  {
    value: "order",
    label: "Pedido"
  },
  {
    value: "feedback",
    label: "Feedback"
  }
];

interface DialogNewChatProps {
  onChatCreated?: (ticket: string) => void;
  token: string;
}

export function DialogNewChat({ onChatCreated, token }: DialogNewChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [data, setData] = useState({
    business: null as Business | null,
    name: "",
    phone: "",
    order: "",
    contactReason: ""
  });

  const handleStartChat = async () => {
    if (!data.business || !data.phone || !data.order || !data.contactReason) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      const phone = `55${data.phone}`;

      setIsLoading(true);
      const businessIdentifier = data.business;
      const response = await startChat(
        token,
        phone,
        data.contactReason,
        data.order,
        businessIdentifier,
        data.name
      );

      if (response.ok) {
        setData({
          business: null,
          name: "",
          phone: "",
          order: "",
          contactReason: ""
        });

        if (onChatCreated) {
          onChatCreated(response.id);
        }

        setIsOpen(false);
      } else {
        setIsOpen(false);
        setData({
          business: null,
          name: "",
          phone: "",
          order: "",
          contactReason: ""
        });
        toast.error("Você já tem um chat aberto com esse usuário");
      }
    } catch (error) {
      toast.error("Erro de conexão");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button className="cursor-pointer bg-amber-700">Novo Chat</Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="mb-3 font-semibold font-sans">
            Iniciar nova conversa {data.business ? `- ${data.business}` : ""}
          </AlertDialogTitle>

          <div className="flex justify-between">
            <div className="flex flex-col w-[60px]">
              <button
                className={`cursor-pointer mb-4 transition-all ${
                  data.business === Business.Fihass
                    ? "ring-2 ring-blue-500 rounded-lg"
                    : ""
                }`}
                onClick={() => setData({ ...data, business: Business.Fihass })}
              >
                <Image
                  src={"/imgs/logos/fihass.png"}
                  alt={`Logo fihass`}
                  width={60}
                  height={60}
                  className="rounded-lg shrink-0"
                />
              </button>

              <button
                className={`cursor-pointer mb-4 transition-all ${
                  data.business === Business.Smatch
                    ? "ring-2 ring-blue-500 rounded-lg"
                    : ""
                }`}
                onClick={() => setData({ ...data, business: Business.Smatch })}
              >
                <Image
                  src={"/imgs/logos/smatch.png"}
                  alt={`Logo smatch burger`}
                  width={60}
                  height={60}
                  className="rounded-lg shrink-0"
                />
              </button>

              <button
                className={`cursor-pointer mb-4 transition-all ${
                  data.business === Business.Match
                    ? "ring-2 ring-blue-500 rounded-lg"
                    : ""
                }`}
                onClick={() => setData({ ...data, business: Business.Match })}
              >
                <Image
                  src={"/imgs/logos/match.png"}
                  alt={`Logo match pizza`}
                  width={60}
                  height={60}
                  className="rounded-lg shrink-0"
                />
              </button>
            </div>

            {data.business && (
              <div className="flex w-[calc(100%-80px)] gap-5 flex-col">
                <Input
                  placeholder="Nome do cliente"
                  value={data.name}
                  onChange={e => setData({ ...data, name: e.target.value })}
                  required
                />

                <Input
                  placeholder="(32) 9999-9999"
                  type="tel"
                  value={data.phone.replace(/\D/g, "")}
                  onChange={e =>
                    setData({
                      ...data,
                      phone: e.target.value.replace(/\D/g, "")
                    })
                  }
                />

                <Input
                  placeholder="Número do pedido"
                  value={data.order}
                  onChange={e => setData({ ...data, order: e.target.value })}
                />

                <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={popoverOpen}
                      className="w-full justify-between"
                    >
                      {data.contactReason
                        ? mockReasons.find(
                            reason => reason.value === data.contactReason
                          )?.label
                        : "Selecione o motivo"}
                      <ChevronsUpDown className="opacity-50 h-4 w-4" />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput placeholder="Buscar motivo..." />
                      <CommandList>
                        <CommandEmpty>Não encontrado.</CommandEmpty>
                        <CommandGroup>
                          {mockReasons.map(reason => (
                            <CommandItem
                              key={reason.value}
                              value={reason.value}
                              onSelect={currentValue => {
                                setData({
                                  ...data,
                                  contactReason: currentValue
                                });
                                setPopoverOpen(false);
                              }}
                            >
                              {reason.label}
                              <Check
                                className={cn(
                                  "ml-auto h-4 w-4",
                                  data.contactReason === reason.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-2.5">
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <Button
            className="bg-green-500 hover:bg-green-700 w-[150px]"
            onClick={handleStartChat}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Iniciando
              </>
            ) : (
              "Iniciar"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
