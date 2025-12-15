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
      <Card className="w-full max-w-md bg-white-70 backdrop-blur-md mt-20 text-white mx-4">
        <CardHeader>
          <CardTitle>Faça login em sua conta</CardTitle>
          <CardDescription>
            Coloque seu usuário e senha para fazer login
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="user">Usuário</Label>
                <Input
                  id="user"
                  type="user"
                  onChange={e => setUser(e.target.value)}
                  value={user}
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Senha</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full cursor-pointer bg-red-500 mt-6 hover:bg-red-700"
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
