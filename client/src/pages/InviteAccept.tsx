import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle, Mail } from "lucide-react";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function InviteAccept() {
  const params = useParams();
  const [, navigate] = useLocation();
  const token = params.token as string;
  const { user, loading: authLoading } = useAuth();
  const [accepting, setAccepting] = useState(false);

  const { data: invite, isLoading, error } = trpc.invites.getByToken.useQuery(
    { token },
    { enabled: !!token }
  );

  const acceptMutation = trpc.invites.accept.useMutation({
    onSuccess: (data) => {
      // Redirect to admin dashboard
      setTimeout(() => {
        navigate("/admin");
      }, 2000);
    },
    onError: (error) => {
      console.error("Error accepting invite:", error);
    },
  });

  useEffect(() => {
    // If user is logged in and invite is valid, auto-accept
    if (user && invite && !accepting && !acceptMutation.isSuccess) {
      setAccepting(true);
      acceptMutation.mutate({ token });
    }
  }, [user, invite, accepting, acceptMutation.isSuccess]);

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <p className="text-sm text-gray-500">Carregando convite...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !invite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <XCircle className="h-6 w-6 text-red-500" />
              <CardTitle>Convite Não Encontrado</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Este link de convite não é válido ou não existe.
            </p>
            <Button onClick={() => navigate("/")} className="w-full">
              Voltar para Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (invite.status === "used") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <XCircle className="h-6 w-6 text-orange-500" />
              <CardTitle>Convite Já Utilizado</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Este convite já foi utilizado e não pode ser usado novamente.
            </p>
            <Button onClick={() => navigate("/")} className="w-full">
              Voltar para Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (invite.status === "revoked") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <XCircle className="h-6 w-6 text-red-500" />
              <CardTitle>Convite Revogado</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Este convite foi revogado pelo administrador e não pode mais ser utilizado.
            </p>
            <Button onClick={() => navigate("/")} className="w-full">
              Voltar para Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (invite.status === "expired" || new Date() > new Date(invite.expiresAt)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <XCircle className="h-6 w-6 text-gray-500" />
              <CardTitle>Convite Expirado</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Este convite expirou em {format(new Date(invite.expiresAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}.
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Entre em contato com o administrador para solicitar um novo convite.
            </p>
            <Button onClick={() => navigate("/")} className="w-full">
              Voltar para Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (acceptMutation.isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              <CardTitle>Convite Aceito!</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Seu acesso foi ativado com sucesso. Redirecionando para o painel administrativo...
            </p>
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (acceptMutation.isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <XCircle className="h-6 w-6 text-red-500" />
              <CardTitle>Erro ao Aceitar Convite</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              {acceptMutation.error?.message || "Ocorreu um erro ao aceitar o convite. Tente novamente."}
            </p>
            <Button onClick={() => navigate("/")} className="w-full">
              Voltar para Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User not logged in - show invite details and login button
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img
                src={APP_LOGO}
                alt={APP_TITLE}
                className="h-16 w-16 rounded-xl object-cover shadow"
              />
            </div>
            <CardTitle className="text-2xl">🎉 Você foi convidado!</CardTitle>
            <CardDescription>
              Você recebeu um convite para acessar o {APP_TITLE}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Detalhes do Convite</span>
              </div>
              {invite.email && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">E-mail:</span> {invite.email}
                </p>
              )}
              <p className="text-sm text-gray-600">
                <span className="font-medium">Permissão:</span>{" "}
                {invite.role === "admin" ? "Administrador" : "Usuário"}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Válido até:</span>{" "}
                {format(new Date(invite.expiresAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>

            <Button
              onClick={() => {
                window.location.href = getLoginUrl(`/convite/${token}`);
              }}
              className="w-full bg-[#c8ff00] hover:bg-[#b8ef00] text-gray-900"
              size="lg"
            >
              Aceitar Convite e Fazer Login
            </Button>

            <p className="text-xs text-center text-gray-500">
              Ao aceitar, você concorda em usar a plataforma de acordo com os termos de uso.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User is logged in and accepting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <p className="text-sm text-gray-500">Ativando seu acesso...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
