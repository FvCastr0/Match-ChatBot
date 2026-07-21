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
import { Customers } from "@/interface/Customers";
import { findAllCustomers } from "@/services/findAllCustomers";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Users, Phone, UserCheck } from "lucide-react";

export default function CustomersPage() {
  const { data: session } = useSession();
  const [customers, setCustomers] = useState<Customers[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user.accessToken) {
      findAllCustomers(session.user.accessToken)
        .then((res) => {
          if (res.ok && res.data) {
            setCustomers(res.data);
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
          <p className="text-slate-500 font-medium">Carregando lista de clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10 text-white">
      <div className="border-b border-border/40 pb-5">
        <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <Users className="w-8 h-8 text-primary" />
          Base de Clientes
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Registro de contatos e telefones que já interagiram com o assistente da Rede Match.
        </p>
      </div>

      <Card className="border border-border/40 bg-card text-card-foreground shadow-md">
        <CardHeader className="bg-white/5 border-b border-border/20">
          <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-500" />
            Clientes Cadastrados ({customers.length})
          </CardTitle>
          <CardDescription className="text-slate-400">
            Contatos de forma automática nas conversas do WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {customers.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              Nenhum cliente cadastrado no momento.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-white/5 border-b border-border/20">
                    <TableHead className="font-bold text-slate-200">Nome do Cliente</TableHead>
                    <TableHead className="font-bold text-slate-200">Telefone / WhatsApp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id} className="hover:bg-white/5 border-b border-border/10 transition-colors">
                      <TableCell className="font-semibold text-white flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                          {customer.name ? customer.name.substring(0, 2).toUpperCase() : "CL"}
                        </div>
                        {customer.name || "Sem Nome"}
                      </TableCell>
                      <TableCell className="text-slate-300 font-mono text-sm">
                        <span className="inline-flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded border border-white/10 text-slate-200">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {customer.phone}
                        </span>
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
