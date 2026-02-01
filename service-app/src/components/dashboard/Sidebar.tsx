"use client";

import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    LogOut,
    MessageSquare,
    Users
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname();

    return (
        <div className={cn("pb-12 h-full bg-slate-100 border-r", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-red-600">
                        Rede Match Dashboard
                    </h2>
                    <div className="space-y-1">
                        <Button
                            variant={pathname === "/dashboard" ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            asChild
                        >
                            <Link href="/dashboard">
                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                Overview
                            </Link>
                        </Button>
                        <Button
                            variant={pathname === "/dashboard/chats" ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            asChild
                        >
                            <Link href="/dashboard/chats">
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Chats
                            </Link>
                        </Button>
                        <Button
                            variant={pathname === "/dashboard/customers" ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            asChild
                        >
                            <Link href="/dashboard/customers">
                                <Users className="mr-2 h-4 w-4" />
                                Clientes
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
            <div className="px-3 py-2 mt-auto">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                        window.location.href = "/";
                    }}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                </Button>
            </div>
        </div>
    );
}
