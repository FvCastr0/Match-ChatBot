"use client";

import {
  OverviewChart,
  ProblemsByCompanyChart,
  StatusPieChart,
  StepDropoffChart,
} from "@/components/dashboard/Charts";
import { StatsCard } from "@/components/dashboard/KPICards";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ITicket } from "@/interface/ITicket";
import { findAllChats } from "@/services/findAllChats";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  HelpCircle,
  MessageSquare,
  TrendingDown,
  Building2,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

// Mapeamento amigável dos enums de passos
const STEP_LABELS: Record<string, string> = {
  started: "Boas-vindas / Início",
  contact_reason: "Seleção do Motivo",
  business_redirect: "Escolha da Empresa",
  place_order_pizza: "Pedido Pizza",
  place_order_burger: "Pedido Hambúrguer",
  place_order_fihass: "Pedido Fihass",
  report_problem: "Relatar Problema",
  attendant: "Aguardando Atendente",
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [chats, setChats] = useState<ITicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user.accessToken) {
      findAllChats(session.user.accessToken)
        .then((res) => {
          if (res.ok && res.data) {
            setChats(res.data);
          } else {
            toast.error("Erro ao carregar dados do dashboard.");
          }
        })
        .finally(() => setLoading(false));
    }
  }, [session]);

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 font-medium">Carregando inteligência de dados...</p>
        </div>
      </div>
    );
  }

  // 1. KPIs Principais
  const totalChats = chats.length;
  const openChats = chats.filter((c) => c.status === "open").length;
  const finishedChats = chats.filter((c) => c.status === "finished").length;
  const unfinishedChats = chats.filter((c) => c.status === "unfinished").length;

  // 2. Gráfico de Status
  const statusData = [
    { name: "Abertos", value: openChats },
    { name: "Finalizados", value: finishedChats },
    { name: "Não Finalizados", value: unfinishedChats },
  ];

  // 3. Atendimentos por Dia (Últimos 7 dias)
  const chatsByDate = chats.reduce((acc: Record<string, number>, chat) => {
    const date = new Date(chat.createdAt).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const overviewData = Object.keys(chatsByDate)
    .map((date) => ({
      name: date,
      total: chatsByDate[date],
    }))
    .slice(-7);

  // 4. INSIGHT 1: Empresas com Mais Problemas
  // Filtra conversas que informaram motivo "problem" ou foram redirecionadas para problemas
  const problemsByCompanyMap: Record<string, number> = {};

  chats.forEach((chat) => {
    const isProblemReason = chat.contactReason === "problem";
    const isProblemStep = chat.currentStep === "report_problem";
    const companyName = chat.business?.name;

    if ((isProblemReason || isProblemStep) && companyName) {
      problemsByCompanyMap[companyName] = (problemsByCompanyMap[companyName] || 0) + 1;
    }
  });

  const problemsByCompanyData = Object.keys(problemsByCompanyMap)
    .map((company) => ({
      company,
      count: problemsByCompanyMap[company],
    }))
    .sort((a, b) => b.count - a.count);

  // 5. INSIGHT 2: Em qual passo os usuários estão parando de conversar (Funil / Dropoff)
  // Agrupa a contagem pelo currentStep dos chats (especialmente os incompletos ou em andamento)
  const stepCountsMap: Record<string, number> = {};

  chats.forEach((chat) => {
    const step = chat.currentStep || "started";
    stepCountsMap[step] = (stepCountsMap[step] || 0) + 1;
  });

  const stepDropoffData = Object.keys(stepCountsMap).map((step) => ({
    step,
    stepLabel: STEP_LABELS[step] || step,
    count: stepCountsMap[step],
  }));

  return (
    <div className="space-y-8 pb-10">
      {/* Top Banner / Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            Painel Executivo & Insights
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Análise em tempo real dos fluxos do WhatsApp, problemas por marca e retenção dos clientes.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total de Atendimentos"
          value={totalChats}
          icon={MessageSquare}
          description="Histórico acumulado"
        />
        <StatsCard
          title="Em Aberto"
          value={openChats}
          icon={Clock}
          description="Fila de atendimento ativa"
        />
        <StatsCard
          title="Finalizados"
          value={finishedChats}
          icon={CheckCircle}
          description="Concluídos com sucesso"
        />
        <StatsCard
          title="Não Concluídos (Abandono)"
          value={unfinishedChats}
          icon={AlertCircle}
          description="Encerrados por inatividade"
        />
      </div>

      {/* Seção 1: Visão Geral de Tráfego e Status */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-border/40 bg-card text-card-foreground shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Volume de Atendimentos por Dia
            </CardTitle>
            <CardDescription className="text-slate-400">Evolução de mensagens nos últimos 7 dias</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart data={overviewData} />
          </CardContent>
        </Card>

        <Card className="col-span-3 border-border/40 bg-card text-card-foreground shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              Distribuição por Status
            </CardTitle>
            <CardDescription className="text-slate-400">Proporção de conversas abertas x concluídas</CardDescription>
          </CardHeader>
          <CardContent>
            <StatusPieChart data={statusData} />
          </CardContent>
        </Card>
      </div>

      {/* Seção 2: INSIGHTS SOLICITADOS PELO GESTOR */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* INSIGHT 1: Empresas com mais problemas */}
        <Card className="col-span-3 border-border/40 shadow-md bg-card text-card-foreground">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Empresas com Mais Reclamações
            </CardTitle>
            <CardDescription className="text-slate-400">
              Volume de chamados onde o motivo do contato foi classificado como **problema**
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProblemsByCompanyChart data={problemsByCompanyData} />
          </CardContent>
        </Card>

        {/* INSIGHT 2: Passo em que os usuários param de conversar */}
        <Card className="col-span-4 border-border/40 shadow-md bg-card text-card-foreground">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-primary" />
              Etapa de Desistência / Retenção do Chatbot
            </CardTitle>
            <CardDescription className="text-slate-400">
              Mapeamento do passo exato onde a conversa parou ou aguarda resposta do cliente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StepDropoffChart data={stepDropoffData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
