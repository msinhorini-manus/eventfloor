import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Copy, Loader2, Plus, RefreshCw, X, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Invites() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [showForm, setShowForm] = useState(false);

  const { data: invites, isLoading, refetch } = trpc.invites.list.useQuery();
  const createMutation = trpc.invites.create.useMutation({
    onSuccess: () => {
      toast.success("Convite criado com sucesso!");
      setEmail("");
      setRole("user");
      setShowForm(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar convite");
    },
  });

  const revokeMutation = trpc.invites.revoke.useMutation({
    onSuccess: () => {
      toast.success("Convite revogado com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao revogar convite");
    },
  });

  const resendMutation = trpc.invites.resend.useMutation({
    onSuccess: () => {
      toast.success("Novo convite criado com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao reenviar convite");
    },
  });

  const handleCreate = () => {
    if (role === "admin" || role === "user") {
      createMutation.mutate({
        email: email || undefined,
        role,
        expiresInDays,
      });
    }
  };

  const handleCopyLink = (token: string) => {
    const link = `${window.location.origin}/convite/${token}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copiado para a área de transferência!");
  };

  const handleWhatsApp = (token: string) => {
    const link = `${window.location.origin}/convite/${token}`;
    const message = encodeURIComponent(
      `Olá! 👋\n\nVocê foi convidado para acessar o Portal ERP - Gestão de Plantas de Eventos.\n\nClique no link abaixo para aceitar o convite:\n${link}\n\nQualquer dúvida, estou à disposição!`
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const getStatusBadge = (status: string, expiresAt: Date) => {
    const isExpired = new Date() > new Date(expiresAt);
    
    if (status === "used") {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Usado</span>;
    }
    if (status === "revoked") {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Revogado</span>;
    }
    if (status === "expired" || isExpired) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Expirado</span>;
    }
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Ativo</span>;
  };

  const getRoleBadge = (role: string) => {
    if (role === "admin") {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Admin</span>;
    }
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Usuário</span>;
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Convites</h1>
            <p className="text-gray-500 mt-1">
              Gerencie convites de acesso à plataforma
            </p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-[#c8ff00] hover:bg-[#b8ef00] text-gray-900"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Convite
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Criar Novo Convite</CardTitle>
              <CardDescription>
                Gere um link de convite para dar acesso à plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail (opcional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="exemplo@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <p className="text-sm text-gray-500">
                  Se informado, apenas este e-mail poderá usar o convite
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Permissão</Label>
                <Select value={role} onValueChange={(value: "user" | "admin") => setRole(value)}>
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuário</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expires">Validade</Label>
                <Select value={expiresInDays.toString()} onValueChange={(value) => setExpiresInDays(parseInt(value))}>
                  <SelectTrigger id="expires">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 dia</SelectItem>
                    <SelectItem value="3">3 dias</SelectItem>
                    <SelectItem value="7">7 dias</SelectItem>
                    <SelectItem value="14">14 dias</SelectItem>
                    <SelectItem value="30">30 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleCreate}
                  disabled={createMutation.isPending}
                  className="bg-[#c8ff00] hover:bg-[#b8ef00] text-gray-900"
                >
                  {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Gerar Convite
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEmail("");
                    setRole("user");
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Lista de Convites</CardTitle>
            <CardDescription>
              {invites?.length || 0} convite(s) criado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : invites && invites.length > 0 ? (
              <div className="space-y-4">
                {invites.map((invite) => {
                  const isActive = invite.status === "pending" && new Date() <= new Date(invite.expiresAt);
                  
                  return (
                    <div key={invite.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            {getStatusBadge(invite.status, invite.expiresAt)}
                            {getRoleBadge(invite.role)}
                          </div>
                          {invite.email && (
                            <p className="text-sm font-medium">{invite.email}</p>
                          )}
                          <p className="text-xs text-gray-500">
                            Criado em {format(new Date(invite.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                          <p className="text-xs text-gray-500">
                            {invite.status === "used" && invite.usedAt ? (
                              `Usado em ${format(new Date(invite.usedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`
                            ) : (
                              `Válido até ${format(new Date(invite.expiresAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`
                            )}
                          </p>
                        </div>
                      </div>

                      {isActive && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Input
                              value={`${window.location.origin}/convite/${invite.token}`}
                              readOnly
                              className="text-sm font-mono"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCopyLink(invite.token)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleWhatsApp(invite.token)}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Enviar por WhatsApp
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => revokeMutation.mutate({ inviteId: invite.id })}
                              disabled={revokeMutation.isPending}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Revogar
                            </Button>
                          </div>
                        </div>
                      )}

                      {(invite.status === "expired" || (invite.status === "pending" && new Date() > new Date(invite.expiresAt))) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resendMutation.mutate({ inviteId: invite.id })}
                          disabled={resendMutation.isPending}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Reenviar
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhum convite criado ainda</p>
                <p className="text-sm mt-1">Clique em "Novo Convite" para começar</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
