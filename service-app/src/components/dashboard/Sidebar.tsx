"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import {
    Bike,
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
        <div className={cn("pb-12 h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border shadow-xl", className)}>
            <div className="space-y-4 py-4">
                <div className="px-4 py-3 border-b border-sidebar-border/80 mb-2">
                    <div className="flex items-center gap-3">
                        <Image 
                            src="/imgs/logos/rede-match.png" 
                            alt="Rede Match Logo" 
                            width={36} 
                            height={36} 
                            className="rounded-lg object-contain bg-white/5 p-1"
                        />
                        <div className="flex flex-col">
                            <h2 className="text-lg font-black tracking-tight text-white">
                                REDE MATCH
                            </h2>
                            <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">Painel de Gestão</p>
                        </div>
                    </div>
                </div>

                <div className="px-3 py-2">
                    <div className="space-y-1.5">
                        <Button
                            variant={pathname === "/dashboard" ? "secondary" : "ghost"}
                            className={cn(
                                "w-full justify-start font-medium transition-all duration-200",
                                pathname === "/dashboard" 
                                    ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/95" 
                                    : "text-slate-300 hover:text-white hover:bg-white/5"
                            )}
                            asChild
                        >
                            <Link href="/dashboard">
                                <LayoutDashboard className="mr-2.5 h-4 w-4" />
                                Visão Geral
                            </Link>
                        </Button>
                        <Button
                            variant={pathname === "/dashboard/chats" ? "secondary" : "ghost"}
                            className={cn(
                                "w-full justify-start font-medium transition-all duration-200",
                                pathname === "/dashboard/chats" 
                                    ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/95" 
                                    : "text-slate-300 hover:text-white hover:bg-white/5"
                            )}
                            asChild
                        >
                            <Link href="/dashboard/chats">
                                <MessageSquare className="mr-2.5 h-4 w-4" />
                                Atendimentos
                            </Link>
                        </Button>
                        <Button
                            variant={pathname === "/dashboard/motoboys" ? "secondary" : "ghost"}
                            className={cn(
                                "w-full justify-start font-medium transition-all duration-200",
                                pathname.startsWith("/dashboard/motoboys") 
                                    ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/95" 
                                    : "text-slate-300 hover:text-white hover:bg-white/5"
                            )}
                            asChild
                        >
                            <Link href="/dashboard/motoboys">
                                <Bike className="mr-2.5 h-4 w-4" />
                                Motoboys
                            </Link>
                        </Button>
                        <Button
                            variant={pathname === "/dashboard/customers" ? "secondary" : "ghost"}
                            className={cn(
                                "w-full justify-start font-medium transition-all duration-200",
                                pathname === "/dashboard/customers" 
                                    ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/95" 
                                    : "text-slate-300 hover:text-white hover:bg-white/5"
                            )}
                            asChild
                        >
                            <Link href="/dashboard/customers">
                                <Users className="mr-2.5 h-4 w-4" />
                                Clientes
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
            <div className="px-3 py-2 mt-auto">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-red-500 hover:text-red-400 hover:bg-red-950/30"
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
