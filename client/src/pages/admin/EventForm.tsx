import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { trpc } from "@/lib/trpc";
import { useLocation, useParams } from "wouter";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";

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
    floorPlanImageUrl: "",
    floorPlanImageKey: "",
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showUnpublishDialog, setShowUnpublishDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        floorPlanImageUrl: event.floorPlanImageUrl || "",
        floorPlanImageKey: event.floorPlanImageKey || "",
      });
      if (event.floorPlanImageUrl) {
        setImagePreview(event.floorPlanImageUrl);
      }
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

  const uploadMutation = trpc.upload.uploadFloorPlan.useMutation({
    onSuccess: (data) => {
      setFormData(prev => ({
        ...prev,
        floorPlanImageUrl: data.url,
        floorPlanImageKey: data.key,
      }));
      setUploadingImage(false);
      toast.success("Imagem enviada com sucesso!");
    },
    onError: (error) => {
      setUploadingImage(false);
      toast.error(error.message || "Erro ao enviar imagem");
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Por favor, selecione uma imagem");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo 10MB");
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    if (isEdit) {
      setUploadingImage(true);
      const base64 = await fileToBase64(file);
      uploadMutation.mutate({
        eventId: eventId,
        fileName: file.name,
        fileData: base64,
        mimeType: file.type,
      });
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
    });
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData(prev => ({
      ...prev,
      floorPlanImageUrl: "",
      floorPlanImageKey: "",
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.slug || !formData.dateStart) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    // If creating new event and has image, upload first
    if (!isEdit && fileInputRef.current?.files?.[0]) {
      toast.error("Salve o evento primeiro, depois faça upload da planta");
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

          {isEdit && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Planta do Evento</CardTitle>
                <CardDescription>
                  {formData.status === 'published' 
                    ? '🔒 Planta bloqueada - mude o status para "Rascunho" para editar'
                    : 'Faça upload da imagem da planta do evento'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.status === 'published' && imagePreview ? (
                  // Evento publicado: apenas visualização
                  <div className="space-y-4">
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview da planta"
                        className="w-full rounded-lg border opacity-75"
                      />
                      <div className="absolute inset-0 bg-gray-900/10 flex items-center justify-center rounded-lg">
                        <div className="bg-white px-6 py-4 rounded-lg shadow-lg text-center max-w-md">
                          <p className="text-lg font-semibold text-gray-900 mb-2">🔒 Planta Bloqueada</p>
                          <p className="text-sm text-gray-600 mb-4">
                            Este evento está publicado. Para editar a planta, é necessário mudar o status para "Rascunho".
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowUnpublishDialog(true)}
                          >
                            Despublicar para Editar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Evento em rascunho: modo de edição
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="floor-plan-upload"
                    />
                    
                    {imagePreview ? (
                      <div className="space-y-4">
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Preview da planta"
                            className="w-full rounded-lg border"
                          />
                          {uploadingImage && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                              <Loader2 className="h-8 w-8 animate-spin text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={handleRemoveImage}
                            disabled={uploadingImage}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Remover Planta
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingImage}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Substituir Planta
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <label
                        htmlFor="floor-plan-upload"
                        className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="h-12 w-12 text-gray-400 mb-3" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Clique para fazer upload</span> ou arraste e solte
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG até 10MB</p>
                        </div>
                      </label>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

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

      {/* Unpublish Confirmation Dialog */}
      <AlertDialog open={showUnpublishDialog} onOpenChange={setShowUnpublishDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>⚠️ Despublicar Evento?</AlertDialogTitle>
            <AlertDialogDescription>
              Ao despublicar, o evento será removido da listagem pública temporariamente.
              Você poderá editar a planta e depois republicar o evento.
              <br /><br />
              <strong>Deseja continuar?</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setFormData(prev => ({ ...prev, status: 'draft' }));
                toast.info('Status alterado para Rascunho. Agora você pode editar a planta.');
              }}
            >
              Sim, Despublicar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
