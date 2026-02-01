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
import { Customers } from "@/interface/Customers";
import { findAllCustomers } from "@/services/findAllCustomers";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

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
                    } else {
                        // Only show error if needed, or handle gracefully
                    }
                })
                .finally(() => setLoading(false));
        }
    }, [session]);

    if (loading) return <div>Carregando clientes...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Clientes</h2>

            <Card>
                <CardHeader>
                    <CardTitle>Lista de Clientes</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Telefone</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {customers.map((customer) => (
                                <TableRow key={customer.id}>
                                    <TableCell className="font-medium">{customer.name || "N/A"}</TableCell>
                                    <TableCell>{customer.phone}</TableCell>
                                    <TableCell className="text-right">
                                        {/* Add actions if needed */}
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
