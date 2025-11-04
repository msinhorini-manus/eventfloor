import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation, useParams } from "wouter";
import { Calendar, MapPin, Loader2, Edit, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
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

export default function EventDetail() {
  const params = useParams();
  const [, navigate] = useLocation();
  const eventId = parseInt(params.id!);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: event, isLoading } = trpc.events.getById.useQuery({ id: eventId });
  const { data: exhibitors } = trpc.exhibitors.listByEventId.useQuery({ eventId });

  const utils = trpc.useUtils();
  const deleteMutation = trpc.events.delete.useMutation({
    onSuccess: () => {
      toast.success("Evento excluído com sucesso!");
      utils.events.listAll.invalidate();
      navigate("/admin/eventos");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao excluir evento");
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate({ id: eventId });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </DashboardLayout>
    );
  }

  if (!event) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-700">Evento não encontrado</h3>
          <Button className="mt-4" onClick={() => navigate("/admin/eventos")}>
            Voltar para Eventos
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{event.name}</h2>
            <div className="flex items-center gap-4 text-gray-600 mt-2">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(event.dateStart).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
              {event.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {event.location}
                </span>
              )}
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                event.status === 'published' 
                  ? 'bg-green-100 text-green-800' 
                  : event.status === 'draft'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {event.status === 'published' ? 'Publicado' : 
                 event.status === 'draft' ? 'Rascunho' : 'Arquivado'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {event.status === 'published' && (
              <Button variant="outline" asChild>
                <a href={`/${event.slug}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver Público
                </a>
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate(`/admin/eventos/${eventId}/editar`)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Event Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informações do Evento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {event.description && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Descrição</h4>
                    <p className="text-gray-600">{event.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Slug (URL)</h4>
                    <p className="text-gray-600">/{event.slug}</p>
                  </div>
                  {event.dateEnd && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-1">Data de Término</h4>
                      <p className="text-gray-600">
                        {new Date(event.dateEnd).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Floor Plan */}
            {event.floorPlanImageUrl && (
              <Card>
                <CardHeader>
                  <CardTitle>Planta do Evento</CardTitle>
                </CardHeader>
                <CardContent>
                  <img 
                    src={event.floorPlanImageUrl} 
                    alt={event.name}
                    className="w-full rounded-lg border"
                  />
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            {/* Exhibitors */}
            <Card>
              <CardHeader>
                <CardTitle>Expositores</CardTitle>
                <CardDescription>
                  {exhibitors?.length || 0} expositor(es) cadastrado(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  Gerenciar Expositores
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline" disabled>
                  Upload de Planta
                </Button>
                <Button className="w-full" variant="outline" disabled>
                  Adicionar Expositor
                </Button>
                <Button className="w-full" variant="outline" disabled>
                  Exportar Dados
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o evento "{event.name}"? 
              Esta ação não pode ser desfeita e todos os expositores associados também serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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
