import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useLocation, useParams } from "wouter";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function EventForm() {
  const params = useParams();
  const [, navigate] = useLocation();
  const eventId = params.id ? parseInt(params.id) : null;
  const isEdit = eventId !== null;

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    dateStart: "",
    dateEnd: "",
    location: "",
    description: "",
    status: "draft" as "draft" | "published" | "archived",
  });

  // Fetch event data if editing
  const { data: event, isLoading: loadingEvent } = trpc.events.getById.useQuery(
    { id: eventId! },
    { enabled: isEdit }
  );

  useEffect(() => {
    if (event) {
      setFormData({
        name: event.name,
        slug: event.slug,
        dateStart: new Date(event.dateStart).toISOString().split('T')[0],
        dateEnd: event.dateEnd ? new Date(event.dateEnd).toISOString().split('T')[0] : "",
        location: event.location || "",
        description: event.description || "",
        status: event.status,
      });
    }
  }, [event]);

  const utils = trpc.useUtils();
  const createMutation = trpc.events.create.useMutation({
    onSuccess: () => {
      toast.success("Evento criado com sucesso!");
      utils.events.listAll.invalidate();
      navigate("/admin/eventos");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar evento");
    },
  });

  const updateMutation = trpc.events.update.useMutation({
    onSuccess: () => {
      toast.success("Evento atualizado com sucesso!");
      utils.events.listAll.invalidate();
      utils.events.getById.invalidate({ id: eventId! });
      navigate(`/admin/eventos/${eventId}`);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar evento");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.slug || !formData.dateStart) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const data = {
      ...formData,
      dateStart: new Date(formData.dateStart),
      dateEnd: formData.dateEnd ? new Date(formData.dateEnd) : undefined,
    };

    if (isEdit) {
      updateMutation.mutate({ id: eventId, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      // Auto-generate slug from name if creating new event
      slug: !isEdit ? name.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') : prev.slug
    }));
  };

  if (loadingEvent) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900">
            {isEdit ? "Editar Evento" : "Novo Evento"}
          </h2>
          <p className="text-gray-600 mt-1">
            {isEdit ? "Atualize as informações do evento" : "Preencha os dados do novo evento"}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>
                Dados principais do evento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Evento *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ex: ERP Summit 2026"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL) *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="erp-summit-2026"
                  required
                />
                <p className="text-sm text-gray-500">
                  URL pública: /{formData.slug}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateStart">Data de Início *</Label>
                  <Input
                    id="dateStart"
                    type="date"
                    value={formData.dateStart}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateStart: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateEnd">Data de Término</Label>
                  <Input
                    id="dateEnd"
                    type="date"
                    value={formData.dateEnd}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateEnd: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Local</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Ex: Expo Center Norte | SP Brasil"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição do evento..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "draft" | "published" | "archived") =>
                    setFormData(prev => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="published">Publicado</SelectItem>
                    <SelectItem value="archived">Arquivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-4 mt-6">
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {isEdit ? "Atualizar Evento" : "Criar Evento"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/eventos")}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
