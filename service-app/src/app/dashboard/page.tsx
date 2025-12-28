"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Customers } from "@/interface/Customers";
import { ITicket } from "@/interface/ITicket";
import { findAllChats } from "@/services/findAllChats";
import { findAllCustomers } from "@/services/findAllCustomers";
import { validateToken } from "@/services/validateToken";
import { AlertDialogDescription } from "@radix-ui/react-alert-dialog";
import { Loader2 } from "lucide-react";

import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  XAxis
} from "recharts";

enum SelectCompanies {
  general = "general",
  match_pizza = "match_pizza",
  smatch_burger = "smatch_burger",
  fihass = "fihass"
}

enum steps {
  started = "Iniciou",
  business_redirect = "Redirecionamento de empresa",
  contact_reason = "Motivo do contato",
  report_problem = "Reportar problema",
  attendant = "Contato atendente"
}

type DateFilter = "today" | "7days" | "30days" | "always" | "custom";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  const [selectedBusiness, setSelectedBusiness] = useState<SelectCompanies>(
    SelectCompanies.general
  );

  const [dateFilter, setDateFilter] = useState<DateFilter>("7days");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [customers, setCustomers] = useState<Customers[]>([]);
  const [chats, setChats] = useState<ITicket[]>([]);

  const selfServiceChartConfig = {
    name: {
      label: "Chats"
    },
    order: {
      label: "Pedidos"
    },
    feedback: {
      label: "Feedbacks"
    }
  } satisfies ChartConfig;

  const startedChartConfig = {
    startedBy: {
      label: "Conversas iniciadas"
    },
    agent: {
      label: "Atendente"
    },
    customer: {
      label: "Cliente"
    }
  } satisfies ChartConfig;

  const chartContactReasonConfig = {
    agent: {
      label: "Atendente",
      color: "var(--chart-1)"
    },
    customer: {
      label: "Cliente",
      color: "var(--chart-2)"
    }
  } satisfies ChartConfig;

  const lineChartConfig = {
    messages: {
      label: "Mensagens enviadas"
    },
    bot: {
      label: "BOT",
      color: "var(--chart-1)"
    },
    customer: {
      label: "Cliente",
      color: "var(--chart-2)"
    },
    agent: {
      label: "Atendente",
      color: "var(--chart-3)"
    }
  } satisfies ChartConfig;
  const [activeChart, setActiveLineChart] =
    React.useState<keyof typeof lineChartConfig>("customer");

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        if (typeof session?.user.accessToken !== "string") return;
        const [customersRes, chatsRes] = await Promise.all([
          findAllCustomers(session.user.accessToken),
          findAllChats(session.user.accessToken)
        ]);

        if (customersRes.data) setCustomers(customersRes.data);
        if (chatsRes.data) setChats(chatsRes.data);
      } catch (error) {
        console.error(error);
        toast.error("Internal error");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [session?.user.accessToken]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      toast.error("Você deve fazer login.");
    }
    const isValid = async () => {
      if (typeof session?.user.accessToken !== "string") return;
      const validation = await validateToken(session?.user.accessToken);
      if (!validation.ok) router.push("/login");
    };
    isValid();
  }, [status, router, session?.user.accessToken]);

  const filteredChats = useMemo(() => {
    if (!chats.length) return [];

    const now = new Date();

    return chats.filter(chat => {
      const createdAt = new Date(chat.createdAt);

      if (
        selectedBusiness !== SelectCompanies.general &&
        chat.business.name !== selectedBusiness.toString()
      ) {
        return false;
      }

      switch (dateFilter) {
        case "today": {
          return createdAt.toDateString() === now.toDateString();
        }

        case "7days": {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(now.getDate() - 7);
          return createdAt >= sevenDaysAgo;
        }

        case "30days": {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(now.getDate() - 30);
          return createdAt >= thirtyDaysAgo;
        }

        case "custom": {
          if (!startDate || !endDate) return false;
          return createdAt >= startDate && createdAt <= endDate;
        }

        case "always":
        default:
          return true;
      }
    });
  }, [chats, dateFilter, startDate, endDate, selectedBusiness]);

  const averageChatDuration = useMemo(() => {
    if (!filteredChats || filteredChats.length === 0) return 0;

    const closedChats = filteredChats.filter(chat => chat.status !== "open");

    if (closedChats.length === 0) return 0;

    const totalTime = closedChats.reduce((acc, chat) => {
      return (
        acc +
        (new Date(chat.closedAt).getTime() - new Date(chat.createdAt).getTime())
      );
    }, 0);

    return (totalTime / closedChats.length / (1000 * 60)).toFixed(1);
  }, [filteredChats]);

  const groupedMessages = useMemo(() => {
    const result = filteredChats.reduce<
      Record<string, { agent: number; customer: number; bot: number }>
    >((acc, chat) => {
      chat.messages.forEach(message => {
        const date = new Date(message.createdAt);
        const dateKey = date.toLocaleDateString("sv-SE");

        if (!acc[dateKey]) {
          acc[dateKey] = { agent: 0, customer: 0, bot: 0 };
        }

        const senderKey = message.sender.toLowerCase() as
          | "agent"
          | "customer"
          | "bot";

        acc[dateKey][senderKey] += 1;
      });

      return acc;
    }, {});

    return Object.entries(result)
      .map(([date, values]) => ({ date, ...values }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredChats]);

  const total = React.useMemo(
    () => ({
      agent: groupedMessages.reduce((acc, curr) => acc + curr.agent, 0),
      bot: groupedMessages.reduce((acc, curr) => acc + curr.bot, 0),
      customer: groupedMessages.reduce((acc, curr) => acc + curr.customer, 0)
    }),
    [groupedMessages]
  );

  const selfServiceChartData = useMemo(() => {
    const orders = filteredChats.filter(
      chat => chat.contactReason === "order"
    ).length;
    const feedback = filteredChats.filter(
      chat => chat.contactReason === "feedback"
    ).length;
    return [
      { reason: "order", name: orders, fill: "#1447E6" },
      { reason: "feedback", name: feedback, fill: "#155DFC" }
    ];
  }, [filteredChats]);

  const startedChartData = useMemo(() => {
    const agent = filteredChats.filter(
      chat => chat.startedBy === "AGENT"
    ).length;
    const customer = filteredChats.filter(
      chat => chat.startedBy === "CUSTOMER"
    ).length;
    return [
      { startedBy: "agent", quantity: agent, fill: "#e69214" },
      { startedBy: "customer", quantity: customer, fill: "#5e3b06" }
    ];
  }, [filteredChats]);

  const contactReasonChartData = useMemo(() => {
    const findData = (startedBy: string, contactReason: string) => {
      return filteredChats.filter(
        chat =>
          chat.startedBy === startedBy && chat.contactReason === contactReason
      ).length;
    };

    return [
      {
        month: "Pedido",
        agent: findData("AGENT", "order"),
        customer: findData("CUSTOMER", "order")
      },
      {
        month: "Problema",
        agent: findData("AGENT", "problem"),
        customer: findData("CUSTOMER", "problem")
      },
      {
        month: "Feedback",
        agent: findData("AGENT", "feedback"),
        customer: findData("CUSTOMER", "feedback")
      }
    ];
  }, [filteredChats]);

  return (
    <div>
      {isLoading ? (
        <div className="flex flex-col items-center mt-10">
          <Image
            src={"/imgs/logos/rede-match.png"}
            width={130}
            height={130}
            alt="Logo"
            className="h-auto w-auto rounded-b-[5rem] rounded-t-4xl mb-3"
          />

          <h1 className="text-muted-foreground font-semibold flex">
            <Loader2 className="animate-spin mr-2" />
            Seu sistema está carregando
          </h1>
        </div>
      ) : (
        <div className="p-6 space-y-8">
          <header className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">
              Seja bem-vindo, {session?.user.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              Visão geral do atendimento e desempenho do sistema
            </p>

            <div className="flex items-center gap-2 text-sm">
              <span>
                Há {chats.filter(chat => chat.status === "open").length} tickets
                abertos.
              </span>
              <Link href="/" className="text-primary font-medium">
                Voltar para conversas
              </Link>
            </div>
          </header>

          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Kpi
              title="Porcentagem de problemas"
              value={`${(
                (filteredChats.filter(chat => chat.contactReason === "problem")
                  .length /
                  filteredChats.length) *
                100
              ).toFixed(1)}%`}
            />
            <Kpi
              title="Média de duração das conversas"
              value={`${averageChatDuration} minutos`}
            />

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Chats não finalizados</CardDescription>

                <CardTitle className="text-2xl">
                  {
                    filteredChats.filter(chat => chat.status === "unfinished")
                      .length
                  }
                </CardTitle>
              </CardHeader>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="mx-1 sm:mx-5 cursor-pointer"
                  >
                    Verificar conversas
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="w-full max-w-none sm:max-w-5xl ">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Conversas</AlertDialogTitle>
                    <AlertDialogDescription className="text-sm text-muted-foreground">
                      Tabela com as conversas não finalizadas ou abertas
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="h-[350px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Iniciado</TableHead>
                          <TableHead>Telefone</TableHead>
                          <TableHead>Etapa</TableHead>
                          <TableHead>Histórico</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {chats
                          .filter(chat => chat.status !== "finished")
                          .map(chat => (
                            <TableRow key={chat.id}>
                              <TableCell className="font-medium">
                                {chat.startedBy === "CUSTOMER"
                                  ? "Cliente"
                                  : "Atendente"}
                              </TableCell>
                              <TableCell>{chat.customer.phone}</TableCell>
                              <TableCell>
                                {(chat.currentStep = steps.attendant)}
                              </TableCell>
                              <TableCell>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant={"outline"}
                                      className="cursor-pointer"
                                    >
                                      Vizualizar
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Telefone do cliente:{" "}
                                        {chat.customer.phone}
                                      </AlertDialogTitle>
                                    </AlertDialogHeader>
                                    <div className="flex flex-col max-h-[400px] overflow-y-auto">
                                      {chat.messages.map(message => (
                                        <div
                                          key={message.id}
                                          className={`${
                                            message.sender === "CUSTOMER"
                                              ? "self-start bg-amber-400 px-2 py-1 rounded-md"
                                              : "self-end bg-amber-600 px-2 py-1 rounded-md"
                                          }`}
                                        >
                                          <p key={message.id}>
                                            {message.content}
                                          </p>
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
                  <AlertDialogFooter>
                    <AlertDialogAction className="cursor-pointer bg-red-500 hover:bg-red-900">
                      Fechar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Quantidade de clientes</CardDescription>

                <CardTitle className="text-2xl">{customers?.length}</CardTitle>
              </CardHeader>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="mx-1 sm:mx-5 cursor-pointer"
                  >
                    Verificar clientes
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clientes</AlertDialogTitle>
                    <AlertDialogDescription className="text-sm text-muted-foreground">
                      Tabela com as informaçõees dos clientes
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="h-[350px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px]">Nome</TableHead>
                          <TableHead>Telefone</TableHead>
                          <TableHead className="text-right">
                            Chats existentes
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customers.map(customer => (
                          <TableRow key={customer.id}>
                            <TableCell className="font-medium">
                              {customer.name}
                            </TableCell>
                            <TableCell>{customer.phone}</TableCell>
                            <TableCell className="text-right">
                              {customer.chats.length}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogAction className="cursor-pointer bg-red-500 hover:bg-red-900">
                      Fechar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </Card>
          </section>

          <section className="grid grid-cols-12 gap-6 items-start">
            <div className="col-span-12 lg:col-span-4 space-y-6">
              <Card>
                <CardContent className="flex flex-wrap gap-2 justify-around ">
                  <Badge
                    variant="outline"
                    className={`cursor-pointer transition-all ${
                      selectedBusiness === SelectCompanies.general
                        ? "bg-red-400 text-white"
                        : ""
                    }`}
                    onClick={() => setSelectedBusiness(SelectCompanies.general)}
                  >
                    Geral
                  </Badge>

                  <Badge
                    variant="outline"
                    className={`cursor-pointer flex gap-1 items-center transition-all ${
                      selectedBusiness === SelectCompanies.match_pizza
                        ? "bg-red-400 text-white"
                        : ""
                    }`}
                    onClick={() =>
                      setSelectedBusiness(SelectCompanies.match_pizza)
                    }
                  >
                    <Image
                      src="/imgs/logos/match.png"
                      width={18}
                      height={18}
                      alt="Logo Match pizza"
                    />
                    Match Pizza
                  </Badge>

                  <Badge
                    variant="outline"
                    className={`cursor-pointer flex gap-1 items-center transition-all ${
                      selectedBusiness === SelectCompanies.smatch_burger
                        ? "bg-red-400 text-white"
                        : ""
                    }`}
                    onClick={() =>
                      setSelectedBusiness(SelectCompanies.smatch_burger)
                    }
                  >
                    <Image
                      src="/imgs/logos/smatch.png"
                      width={18}
                      height={18}
                      alt="Logo Smatch burger"
                    />
                    Smatch Burger
                  </Badge>

                  <Badge
                    variant="outline"
                    className={`cursor-pointer flex gap-1 items-center transition-all ${
                      selectedBusiness === SelectCompanies.fihass
                        ? "bg-red-400 text-white"
                        : ""
                    }`}
                    onClick={() => setSelectedBusiness(SelectCompanies.fihass)}
                  >
                    <Image
                      src="/imgs/logos/fihass.png"
                      width={18}
                      height={18}
                      alt="Logo Fihass"
                      className="rounded-full"
                    />
                    Fihass
                  </Badge>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Filtro</CardTitle>
                  <CardDescription>
                    Escolha o período de análise
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {dateFilter !== "custom" ? (
                    <RadioGroup
                      value={dateFilter}
                      onValueChange={value =>
                        setDateFilter(value as DateFilter)
                      }
                      className="space-y-2"
                    >
                      <Option value="today" label="Hoje" />
                      <Option value="7days" label="Últimos 7 dias" />
                      <Option value="30days" label="Últimos 30 dias" />
                      <Option value="always" label="Sempre" />
                    </RadioGroup>
                  ) : (
                    <>
                      <div className="space-y-1">
                        <Label>Data inicial</Label>
                        <Input
                          type="date"
                          onChange={e => setStartDate(new Date(e.target.value))}
                        />
                      </div>

                      <div className="space-y-1">
                        <Label>Data final</Label>
                        <Input
                          type="date"
                          onChange={e => setEndDate(new Date(e.target.value))}
                        />
                      </div>
                    </>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDateFilter("custom")}
                  >
                    {dateFilter !== "custom"
                      ? "Usar período rápido"
                      : "Data personalizada"}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="items-center ">
                  <CardTitle>Motivos de contato</CardTitle>
                  <CardDescription>
                    Mostrando a relação entre motivo de contato e conversas
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-0">
                  <ChartContainer
                    config={chartContactReasonConfig}
                    className="mx-auto aspect-square max-h-[350px]"
                  >
                    <RadarChart data={contactReasonChartData}>
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="line" />}
                      />
                      <PolarAngleAxis dataKey="month" />
                      <PolarGrid radialLines={false} />
                      <Radar
                        dataKey="agent"
                        fill="orange"
                        fillOpacity={0}
                        stroke="orange"
                        strokeWidth={2}
                      />
                      <Radar
                        dataKey="customer"
                        fill="green"
                        fillOpacity={0}
                        stroke="green"
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            <div className="col-span-12 lg:col-span-8 space-y-6">
              <div className="col-span-12 lg:col-span-8">
                <Card className="py-4 sm:py-0">
                  <CardHeader className="flex flex-col items-stretch border-b p-0 sm:flex-row">
                    <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
                      <CardTitle>Mensagens</CardTitle>
                      <CardDescription>
                        Mostra um gráfico que representa o total de mensagens
                      </CardDescription>
                    </div>
                    <div className="flex">
                      {["customer", "bot", "agent"].map(key => {
                        const chart = key as keyof typeof lineChartConfig;
                        return (
                          <button
                            key={chart}
                            data-active={activeChart === chart}
                            className="data-[active=true]:bg-muted/50 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                            onClick={() => setActiveLineChart(chart)}
                          >
                            <span className="text-muted-foreground text-xs">
                              {lineChartConfig[chart].label}
                            </span>
                            <span className="text-lg leading-none font-bold sm:text-3xl">
                              {total[key as keyof typeof total]}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </CardHeader>

                  <CardContent className="px-2 sm:p-6">
                    <ChartContainer
                      config={lineChartConfig}
                      className="aspect-auto h-[250px] w-full"
                    >
                      <LineChart
                        accessibilityLayer
                        data={groupedMessages}
                        margin={{
                          left: 12,
                          right: 12
                        }}
                      >
                        <CartesianGrid vertical={false} />
                        <XAxis
                          dataKey="date"
                          tickFormatter={value =>
                            new Date(`${value}T00:00:00`).toLocaleDateString(
                              "pt-BR",
                              {
                                day: "2-digit",
                                month: "short"
                              }
                            )
                          }
                        />
                        <ChartTooltip
                          content={
                            <ChartTooltipContent
                              className="w-[150px]"
                              nameKey="messages"
                              labelFormatter={value => {
                                return new Date(value).toLocaleDateString(
                                  "pt-BR",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric"
                                  }
                                );
                              }}
                            />
                          }
                        />
                        <Line
                          dataKey={activeChart}
                          type="monotone"
                          stroke={`var(--color-${activeChart})`}
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>

              <div className="flex gap-4 flex-col sm:flex-row">
                <div className="col-span-12 lg:col-span-4">
                  <Card className="h-full ">
                    <CardHeader>
                      <CardTitle>
                        Taxa de autoatendimento
                        <span className="ml-2 text-sm text-muted-foreground">
                          {(
                            (filteredChats.filter(
                              chat => chat.contactReason !== "problem"
                            ).length *
                              100) /
                            filteredChats.length
                          ).toFixed(2)}
                          %
                        </span>
                      </CardTitle>
                      <CardDescription>
                        Comparativo entre atendimento humano e automático
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <ChartContainer
                        config={selfServiceChartConfig}
                        className="mx-auto aspect-square max-h-80"
                      >
                        <PieChart>
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                          />
                          <Pie
                            data={selfServiceChartData}
                            dataKey="name"
                            nameKey="reason"
                          />
                        </PieChart>
                      </ChartContainer>
                    </CardContent>

                    <CardFooter className="text-sm text-muted-foreground">
                      Quanto maior o autoatendimento, menor a necessidade de
                      intervenção humana.
                    </CardFooter>
                  </Card>
                </div>

                <div className="col-span-12 lg:col-span-4">
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle>Conversas iniciadas</CardTitle>
                      <CardDescription>
                        Comparativo entre conversas iniciadas por clientes e
                        atendente
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <ChartContainer
                        config={startedChartConfig}
                        className="mx-auto aspect-square max-h-80"
                      >
                        <PieChart>
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                          />
                          <Pie
                            data={startedChartData}
                            dataKey="quantity"
                            nameKey="startedBy"
                          />
                        </PieChart>
                      </ChartContainer>
                    </CardContent>

                    <CardFooter className="text-sm text-muted-foreground">
                      Quanto maior no número de clientes, mais pessoas novas
                      estão chegando até você
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function Kpi({ title, value }: { title: string; value: number | string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}

function Option({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-center space-x-2">
      <RadioGroupItem value={value} id={value} />
      <Label htmlFor={value}>{label}</Label>
    </div>
  );
}
