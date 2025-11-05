import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Plus, Pencil, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";

const tierLabels: Record<string, string> = {
  diamond: "Diamante",
  gold: "Ouro",
  silver: "Prata",
  bronze: "Bronze",
};

const tierColors: Record<string, string> = {
  diamond: "bg-cyan-500 text-gray-900",
  gold: "bg-yellow-500 text-gray-900",
  silver: "bg-gray-400 text-gray-900",
  bronze: "bg-orange-700 text-gray-900",
};

export default function SponsorsList() {
  const { data: sponsors, isLoading, refetch } = trpc.sponsors.listAll.useQuery();
  const deleteMutation = trpc.sponsors.delete.useMutation({
    onSuccess: () => {
      toast.success("Patrocinador excluído com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao excluir patrocinador: ${error.message}`);
    },
  });

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`Tem certeza que deseja excluir o patrocinador "${name}"?`)) {
      deleteMutation.mutate({ id });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Patrocinadores</h1>
          <p className="text-gray-600 mt-1">Gerencie os patrocinadores do evento</p>
        </div>
        <Link href="/admin/patrocinadores/novo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Patrocinador
          </Button>
        </Link>
      </div>

      {sponsors && sponsors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sponsors.map((sponsor) => (
            <Card key={sponsor.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${tierColors[sponsor.tier]}`}>
                        {tierLabels[sponsor.tier]}
                      </span>
                      {!sponsor.isActive && (
                        <span className="px-2 py-1 rounded text-xs font-bold bg-gray-300 text-gray-700">
                          Inativo
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-xl">{sponsor.name}</CardTitle>
                    <CardDescription>Ordem: {sponsor.displayOrder}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {sponsor.logoUrl && (
                  <div className="mb-4 bg-gray-50 rounded-lg p-4 flex items-center justify-center">
                    <img
                      src={sponsor.logoUrl}
                      alt={sponsor.name}
                      className="max-h-24 max-w-full object-contain"
                    />
                  </div>
                )}
                {sponsor.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{sponsor.description}</p>
                )}
                {sponsor.website && (
                  <a
                    href={sponsor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 mb-4"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Visitar website
                  </a>
                )}
                <div className="flex gap-2">
                  <Link href={`/admin/patrocinadores/${sponsor.id}/editar`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Pencil className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(sponsor.id, sponsor.name)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600 mb-4">Nenhum patrocinador cadastrado ainda.</p>
            <Link href="/admin/patrocinadores/novo">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Patrocinador
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
