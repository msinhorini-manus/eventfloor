import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useParams, useLocation, Link } from "wouter";
import { Loader2, Plus, Pencil, Trash2, ArrowLeft, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const tierLabels = {
  diamond: "Diamante",
  gold: "Ouro",
  silver: "Prata",
  bronze: "Bronze",
};

const tierColors = {
  diamond: "bg-cyan-500",
  gold: "bg-yellow-500",
  silver: "bg-gray-400",
  bronze: "bg-orange-700",
};

export default function EventSponsors() {
  const params = useParams();
  const [, navigate] = useLocation();
  const eventId = parseInt(params.id!);
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedSponsorId, setSelectedSponsorId] = useState<number | null>(null);
  const [selectedTier, setSelectedTier] = useState<"diamond" | "gold" | "silver" | "bronze">("gold");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: event, isLoading: eventLoading } = trpc.events.getById.useQuery({ id: eventId });
  const { data: eventSponsors, isLoading: sponsorsLoading } = trpc.eventSponsors.listByEventId.useQuery({ eventId });
  const { data: allSponsors } = trpc.sponsors.listAll.useQuery();

  const utils = trpc.useUtils();

  const addMutation = trpc.eventSponsors.addToEvent.useMutation({
    onSuccess: () => {
      toast.success("Patrocinador adicionado ao evento!");
      utils.eventSponsors.listByEventId.invalidate({ eventId });
      setShowAddDialog(false);
      setSelectedSponsorId(null);
      setSelectedTier("gold");
      setDisplayOrder("0");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao adicionar patrocinador");
    },
  });

  const deleteMutation = trpc.eventSponsors.removeFromEvent.useMutation({
    onSuccess: () => {
      toast.success("Patrocinador removido do evento!");
      utils.eventSponsors.listByEventId.invalidate({ eventId });
      setShowDeleteDialog(false);
      setDeleteId(null);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao remover patrocinador");
    },
  });

  const handleAdd = () => {
    if (!selectedSponsorId) {
      toast.error("Selecione um patrocinador");
      return;
    }

    addMutation.mutate({
      eventId,
      sponsorId: selectedSponsorId,
      tier: selectedTier,
      displayOrder: parseInt(displayOrder) || 0,
    });
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate({ id: deleteId });
    }
  };

  const openDeleteDialog = (id: number) => {
    setDeleteId(id);
    setShowDeleteDialog(true);
  };

  // Filter out sponsors already added to this event
  const availableSponsors = allSponsors?.filter(
    (sponsor) => !eventSponsors?.some((es) => es.sponsorId === sponsor.id)
  );

  if (eventLoading || sponsorsLoading) {
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/admin/eventos/${eventId}`)}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <h2 className="text-3xl font-bold text-gray-900">Patrocinadores</h2>
            <p className="text-gray-600 mt-1">Evento: {event.name}</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Patrocinador
          </Button>
        </div>

        {!eventSponsors || eventSponsors.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500 mb-4">Nenhum patrocinador vinculado a este evento ainda</p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeiro Patrocinador
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {eventSponsors.map((es) => (
              <Card key={es.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium text-white ${tierColors[es.tier]}`}>
                    {tierLabels[es.tier]}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openDeleteDialog(es.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>

                {es.sponsor?.logoUrl && (
                  <div className="mb-3 flex items-center justify-center h-24 bg-gray-50 rounded">
                    <img
                      src={es.sponsor.logoUrl}
                      alt={es.sponsor.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                )}

                <h3 className="font-semibold text-gray-900 mb-1">{es.sponsor?.name}</h3>
                <p className="text-sm text-gray-500 mb-2">Ordem: {es.displayOrder}</p>

                {es.sponsor?.website && (
                  <a
                    href={es.sponsor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                  >
                    Visitar website
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Sponsor Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Patrocinador ao Evento</DialogTitle>
            <DialogDescription>
              Selecione um patrocinador da lista global e defina o nível de patrocínio para este evento.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="sponsor">Patrocinador *</Label>
              <Select
                value={selectedSponsorId?.toString() || ""}
                onValueChange={(value) => setSelectedSponsorId(parseInt(value))}
              >
                <SelectTrigger id="sponsor">
                  <SelectValue placeholder="Selecione um patrocinador" />
                </SelectTrigger>
                <SelectContent>
                  {availableSponsors?.map((sponsor) => (
                    <SelectItem key={sponsor.id} value={sponsor.id.toString()}>
                      {sponsor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tier">Nível de Patrocínio *</Label>
              <Select value={selectedTier} onValueChange={(value: any) => setSelectedTier(value)}>
                <SelectTrigger id="tier">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diamond">Diamante</SelectItem>
                  <SelectItem value="gold">Ouro</SelectItem>
                  <SelectItem value="silver">Prata</SelectItem>
                  <SelectItem value="bronze">Bronze</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="displayOrder">Ordem de Exibição</Label>
              <Input
                id="displayOrder"
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">Números menores aparecem primeiro</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAdd} disabled={addMutation.isPending}>
              {addMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar remoção</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este patrocinador do evento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
