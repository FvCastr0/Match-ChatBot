"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { MessageSquare, Filter, Building, AlertCircle } from "lucide-react";

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

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 font-medium">Carregando atendimentos...</p>
        </div>
      </div>
    );
  }

  // Extract unique businesses
  const businesses = Array.from(
    new Set(chats.map((chat) => chat.business?.name).filter(Boolean))
  );

  const filteredChats = chats.filter((chat) => {
    const matchesBusiness =
      businessFilter === "all" || chat.business?.name === businessFilter;
    const matchesStatus =
      statusFilter === "all" || chat.status === statusFilter;
    return matchesBusiness && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-emerald-500 hover:bg-emerald-600 text-white font-medium";
      case "finished":
        return "bg-blue-500 hover:bg-blue-600 text-white font-medium";
      case "unfinished":
        return "bg-slate-500 hover:bg-slate-600 text-white font-medium";
      default:
        return "bg-slate-500";
    }
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case "open":
        return "Aberto";
      case "finished":
        return "Finalizado";
      case "unfinished":
        return "Incompleto";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-8 pb-10 text-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-primary" />
            Histórico de Atendimentos
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Consulte e filtre todas as conversas registradas pelo assistente virtual da Rede Match.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-card px-3 py-1.5 rounded-lg border border-border/40 shadow-sm">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              className="bg-transparent text-sm font-medium text-slate-200 focus:outline-none cursor-pointer"
              value={businessFilter}
              onChange={(e) => setBusinessFilter(e.target.value)}
            >
              <option value="all" className="bg-card">Todas as Empresas</option>
              {businesses.map((business, index) => (
                <option key={index} value={business as string} className="bg-card">
                  {business}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-card px-3 py-1.5 rounded-lg border border-border/40 shadow-sm">
            <select
              className="bg-transparent text-sm font-medium text-slate-200 focus:outline-none cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all" className="bg-card">Todos os Status</option>
              <option value="open" className="bg-card">Aberto</option>
              <option value="finished" className="bg-card">Finalizado</option>
              <option value="unfinished" className="bg-card">Incompleto</option>
            </select>
          </div>
        </div>
      </div>

      <Card className="border border-border/40 bg-card text-card-foreground shadow-md">
        <CardHeader className="bg-white/5 border-b border-border/20">
          <CardTitle className="text-lg font-bold text-white">
            Lista de Conversas ({filteredChats.length})
          </CardTitle>
          <CardDescription className="text-slate-400">
            Exibindo atendimentos de acordo com os filtros selecionados
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {filteredChats.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              Nenhum atendimento encontrado para os filtros selecionados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-white/5 border-b border-border/20">
                    <TableHead className="font-bold text-slate-200">Cliente</TableHead>
                    <TableHead className="font-bold text-slate-200">Empresa Solicitada</TableHead>
                    <TableHead className="font-bold text-slate-200">Motivo de Contato</TableHead>
                    <TableHead className="font-bold text-slate-200">Status</TableHead>
                    <TableHead className="font-bold text-slate-200">Data de Criação</TableHead>
                    <TableHead className="text-right font-bold text-slate-200">Msgs</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredChats.map((chat) => (
                    <TableRow key={chat.id} className="hover:bg-white/5 border-b border-border/10 transition-colors">
                      <TableCell className="font-semibold text-white flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-xs">
                          {chat.customer.name ? chat.customer.name.substring(0, 2).toUpperCase() : "CL"}
                        </div>
                        {chat.customer.name || "Cliente Desconhecido"}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {chat.business?.name ? (
                          <Badge variant="outline" className="border-white/20 bg-white/5 font-medium text-white">
                            <Building className="w-3 h-3 mr-1 text-primary" />
                            {chat.business.name}
                          </Badge>
                        ) : (
                          <span className="text-slate-500 italic text-sm">Não selecionado</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            chat.contactReason === "problem"
                              ? "bg-amber-950/40 text-amber-500 font-medium border border-amber-500/20"
                              : chat.contactReason === "order"
                              ? "bg-emerald-950/40 text-emerald-500 font-medium border border-emerald-500/20"
                              : "bg-slate-800 text-slate-300 font-medium"
                          }
                        >
                          {chat.contactReason === "problem"
                            ? "Problema / Reclamação"
                            : chat.contactReason === "order"
                            ? "Fazer Pedido"
                            : chat.contactReason === "feedback"
                            ? "Feedback"
                            : "N/I"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(chat.status)}>
                          {translateStatus(chat.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-300 text-sm">
                        {chat.createdAt &&
                          format(new Date(chat.createdAt), "dd/MM/yyyy HH:mm", {
                            locale: ptBR,
                          })}
                      </TableCell>
                      <TableCell className="text-right font-bold text-slate-300">
                        {chat.messages?.length || 0}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
