import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Edit, Trash2, Loader2, ArrowLeft } from "lucide-react";
import { Link, useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ExhibitorsList() {
  const params = useParams();
  const [, navigate] = useLocation();
  const eventId = parseInt(params.eventId!);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: event } = trpc.events.getById.useQuery({ id: eventId });
  const { data: exhibitors, isLoading } = trpc.exhibitors.listByEventId.useQuery({ eventId });

  const utils = trpc.useUtils();
  const deleteMutation = trpc.exhibitors.delete.useMutation({
    onSuccess: () => {
      toast.success("Expositor excluído com sucesso!");
      utils.exhibitors.listByEventId.invalidate({ eventId });
      setDeleteId(null);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao excluir expositor");
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/admin/eventos/${eventId}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-900">Expositores</h2>
            {event && (
              <p className="text-gray-600 mt-1">Evento: {event.name}</p>
            )}
          </div>
          <Link href={`/admin/eventos/${eventId}/expositores/novo`}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Expositor
            </Button>
          </Link>
        </div>

        <Card>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : exhibitors && exhibitors.length > 0 ? (
              <div className="space-y-4">
                {exhibitors.map((exhibitor) => (
                  <div
                    key={exhibitor.id}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {exhibitor.logoUrl ? (
                      <img
                        src={exhibitor.logoUrl}
                        alt={exhibitor.name}
                        className="w-16 h-16 object-contain rounded border"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs font-bold">
                        {exhibitor.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-lg">
                        {exhibitor.name}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        {exhibitor.category && (
                          <span>Categoria: {exhibitor.category}</span>
                        )}
                        {exhibitor.boothNumber && (
                          <span>Stand: {exhibitor.boothNumber}</span>
                        )}
                        {exhibitor.positionX && exhibitor.positionY && (
                          <span className="text-green-600">✓ Posicionado</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <Link href={`/admin/eventos/${eventId}/expositores/${exhibitor.id}/editar`}>
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Link>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteId(exhibitor.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h4 className="text-lg font-semibold text-gray-700 mb-2">
                  Nenhum expositor cadastrado
                </h4>
                <p className="text-gray-600 mb-4">
                  Comece adicionando expositores ao evento
                </p>
                <Link href={`/admin/eventos/${eventId}/expositores/novo`}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Expositor
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este expositor? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate({ id: deleteId })}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
