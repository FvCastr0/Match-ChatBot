"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

export default function Login() {
  const [user, setUser] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        name: user,
        password,
        redirect: false
      });

      setIsLoading(true);

      if (result?.error) {
        toast.error(result.error);
        setIsLoading(false);
      } else {
        toast.success("Login efetuado com sucesso.");
        router.push("/");
      }
    } catch (e) {
      toast.error("Internal error");
      console.error(e);
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-start justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/imgs/fundo.png')" }}
    >
      <Card className="w-full max-w-md bg-black/60 border border-white/10 backdrop-blur-md mt-20 text-white mx-4 shadow-2xl">
        <CardHeader className="space-y-1.5">
          <CardTitle className="text-2xl font-black text-center tracking-tight">FAÇA LOGIN EM SUA CONTA</CardTitle>
          <CardDescription className="text-slate-300 text-center">
            Coloque seu usuário e senha para fazer login
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-5">
              <div className="grid gap-2">
                <Label htmlFor="user" className="text-slate-200 font-semibold">Usuário</Label>
                <Input
                  id="user"
                  type="user"
                  onChange={e => setUser(e.target.value)}
                  value={user}
                  className="bg-white/5 border-white/10 text-white focus:border-primary/50 focus:ring-primary/50"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password" className="text-slate-200 font-semibold">Senha</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="bg-white/5 border-white/10 text-white focus:border-primary/50 focus:ring-primary/50"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full cursor-pointer bg-primary hover:bg-primary/90 text-white mt-6 font-bold uppercase tracking-wider transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logando
                </>
              ) : (
                "Logar"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
