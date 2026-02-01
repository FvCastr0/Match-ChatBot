"use client";

import { OverviewChart, StatusPieChart } from "@/components/dashboard/Charts";
import { StatsCard } from "@/components/dashboard/KPICards";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ITicket } from "@/interface/ITicket";
import { findAllChats } from "@/services/findAllChats";
import { MessageSquare, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

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

    if (loading) return <div>Carregando dados...</div>;

    // KPIs
    const totalChats = chats.length;
    const openChats = chats.filter((c) => c.status === "open").length;
    const finishedChats = chats.filter((c) => c.status === "finished").length;
    const unfinishedChats = chats.filter((c) => c.status === "unfinished").length;

    // Data for Charts
    const statusData = [
        { name: "Abertos", value: openChats },
        { name: "Finalizados", value: finishedChats },
        { name: "Não Finalizados", value: unfinishedChats },
    ];

    // Group by Date for Overview
    const chatsByDate = chats.reduce((acc: any, chat) => {
        const date = new Date(chat.createdAt).toLocaleDateString('pt-BR');
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {});

    const overviewData = Object.keys(chatsByDate).map(date => ({
        name: date,
        total: chatsByDate[date]
    })).slice(-7); // Last 7 days

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total de Chats"
                    value={totalChats}
                    icon={MessageSquare}
                    description="Todos os tempos"
                />
                <StatsCard
                    title="Em Aberto"
                    value={openChats}
                    icon={Clock}
                    description="Aguardando atendimento"
                />
                <StatsCard
                    title="Finalizados"
                    value={finishedChats}
                    icon={CheckCircle}
                    description="Atendimento concluído"
                />
                <StatsCard
                    title="Incompletos"
                    value={unfinishedChats}
                    icon={AlertCircle}
                    description="Fechados automaticamente"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Visão Geral</CardTitle>
                        <CardDescription>
                            Chats por dia (Últimos 7 dias)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <OverviewChart data={overviewData} />
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Status dos Atendimentos</CardTitle>
                        <CardDescription>
                            Distribuição por status
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <StatusPieChart data={statusData} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
