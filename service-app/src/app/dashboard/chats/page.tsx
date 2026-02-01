"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ITicket } from "@/interface/ITicket";
import { findAllChats } from "@/services/findAllChats";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ChatsPage() {
    const { data: session } = useSession();
    const [chats, setChats] = useState<ITicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [businessFilter, setBusinessFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        if (session?.user.accessToken) {
            findAllChats(session.user.accessToken)
                .then((res) => {
                    if (res.ok && res.data) {
                        setChats(res.data);
                    }
                })
                .finally(() => setLoading(false));
        }
    }, [session]);

    if (loading) return <div>Carregando chats...</div>;

    // Extract unique businesses
    const businesses = Array.from(new Set(chats.map(chat => chat.business?.name).filter(Boolean)));

    const filteredChats = chats.filter(chat => {
        const matchesBusiness = businessFilter === "all" || chat.business?.name === businessFilter;
        const matchesStatus = statusFilter === "all" || chat.status === statusFilter;
        return matchesBusiness && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "open": return "bg-green-500 hover:bg-green-600";
            case "finished": return "bg-blue-500 hover:bg-blue-600";
            case "unfinished": return "bg-gray-500 hover:bg-gray-600";
            default: return "bg-slate-500";
        }
    }

    const translateStatus = (status: string) => {
        switch (status) {
            case "open": return "Aberto";
            case "finished": return "Finalizado";
            case "unfinished": return "Incompleto";
            default: return status;
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Atendimentos</h2>
                <div className="flex gap-4">
                    <select
                        className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={businessFilter}
                        onChange={(e) => setBusinessFilter(e.target.value)}
                    >
                        <option value="all">Todas as Empresas</option>
                        {businesses.map((business, index) => (
                            <option key={index} value={business as string}>{business}</option>
                        ))}
                    </select>

                    <select
                        className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">Todos os Status</option>
                        <option value="open">Aberto</option>
                        <option value="finished">Finalizado</option>
                        <option value="unfinished">Incompleto</option>
                    </select>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Histórico de Conversas</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Empresa</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Data de Criação</TableHead>
                                <TableHead className="text-right">Mensagens</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredChats.map((chat) => (
                                <TableRow key={chat.id}>
                                    <TableCell className="font-medium">{chat.customer.name}</TableCell>
                                    <TableCell>{chat.business?.name || "N/A"}</TableCell>
                                    <TableCell>
                                        <Badge className={getStatusColor(chat.status)}>
                                            {translateStatus(chat.status)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {chat.createdAt && format(new Date(chat.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {chat.messages?.length || 0}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
