import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useLocation, useParams } from "wouter";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Loader2, Upload, X, ArrowLeft, MapPin } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export default function ExhibitorForm() {
  const params = useParams();
  const [, navigate] = useLocation();
  const eventId = parseInt(params.eventId!);
  const exhibitorId = params.exhibitorId ? parseInt(params.exhibitorId) : null;
  const isEdit = exhibitorId !== null;

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    logoUrl: "",
    logoKey: "",
    description: "",
    website: "",
    category: "",
    boothNumber: "",
    positionX: undefined as number | undefined,
    positionY: undefined as number | undefined,
    featured: false,
  });

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [selectingPosition, setSelectingPosition] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: event } = trpc.events.getById.useQuery({ id: eventId });
  const { data: exhibitor, isLoading: loadingExhibitor } = trpc.exhibitors.getById.useQuery(
    { id: exhibitorId! },
    { enabled: isEdit }
  );

  useEffect(() => {
    if (exhibitor) {
      setFormData({
        name: exhibitor.name,
        slug: exhibitor.slug,
        logoUrl: exhibitor.logoUrl || "",
        logoKey: exhibitor.logoKey || "",
        description: exhibitor.description || "",
        website: exhibitor.website || "",
        category: exhibitor.category || "",
        boothNumber: exhibitor.boothNumber || "",
        positionX: exhibitor.positionX || undefined,
        positionY: exhibitor.positionY || undefined,
        featured: exhibitor.featured,
      });
      if (exhibitor.logoUrl) {
        setLogoPreview(exhibitor.logoUrl);
      }
    }
  }, [exhibitor]);

  const utils = trpc.useUtils();
  
  const uploadMutation = trpc.upload.uploadExhibitorLogo.useMutation({
    onSuccess: (data) => {
      setFormData(prev => ({
        ...prev,
        logoUrl: data.url,
        logoKey: data.key,
      }));
      setUploadingLogo(false);
      toast.success("Logo enviado com sucesso!");
    },
    onError: (error) => {
      setUploadingLogo(false);
      toast.error(error.message || "Erro ao enviar logo");
    },
  });

  const createMutation = trpc.exhibitors.create.useMutation({
    onSuccess: () => {
      toast.success("Expositor criado com sucesso!");
      utils.exhibitors.listByEventId.invalidate({ eventId });
      navigate(`/admin/eventos/${eventId}/expositores`);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar expositor");
    },
  });

  const updateMutation = trpc.exhibitors.update.useMutation({
    onSuccess: () => {
      toast.success("Expositor atualizado com sucesso!");
      utils.exhibitors.listByEventId.invalidate({ eventId });
      utils.exhibitors.getById.invalidate({ id: exhibitorId! });
      navigate(`/admin/eventos/${eventId}/expositores`);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar expositor");
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Por favor, selecione uma imagem");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setUploadingLogo(true);
    const base64 = await fileToBase64(file);
    uploadMutation.mutate({
      eventId,
      exhibitorId: exhibitorId || undefined,
      fileName: file.name,
      fileData: base64,
      mimeType: file.type,
    });
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

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setFormData(prev => ({
      ...prev,
      logoUrl: "",
      logoKey: "",
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFloorPlanClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!selectingPosition) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setFormData(prev => ({
      ...prev,
      positionX: Math.round(x * 100) / 100,
      positionY: Math.round(y * 100) / 100,
    }));
    setSelectingPosition(false);
    toast.success("Posição marcada na planta!");
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: !isEdit ? name.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') : prev.slug
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.slug) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const data = {
      eventId,
      ...formData,
    };

    if (isEdit) {
      updateMutation.mutate({ id: exhibitorId, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (loadingExhibitor) {
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
      <div className="max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/admin/eventos/${eventId}/expositores`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              {isEdit ? "Editar Expositor" : "Novo Expositor"}
            </h2>
            {event && (
              <p className="text-gray-600 mt-1">Evento: {event.name}</p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Básicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Expositor *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Ex: Totvs"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug (URL) *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="totvs"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Categoria</Label>
                      <Input
                        id="category"
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        placeholder="Ex: ERP"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="boothNumber">Número do Stand</Label>
                      <Input
                        id="boothNumber"
                        value={formData.boothNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, boothNumber: e.target.value }))}
                        placeholder="Ex: A-123"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://www.exemplo.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descrição do expositor..."
                      rows={4}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) =>
                        setFormData(prev => ({ ...prev, featured: checked as boolean }))
                      }
                    />
                    <Label htmlFor="featured" className="cursor-pointer">
                      Expositor em destaque
                    </Label>
                  </div>
                </CardContent>
              </Card>

              {/* Floor Plan Position */}
              {event?.floorPlanImageUrl && (
                <Card>
                  <CardHeader>
                    <CardTitle>Posição na Planta</CardTitle>
                    <CardDescription>
                      Clique na planta para marcar a posição do expositor
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      type="button"
                      variant={selectingPosition ? "default" : "outline"}
                      onClick={() => setSelectingPosition(!selectingPosition)}
                      className="w-full"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      {selectingPosition ? "Clique na planta para marcar" : "Marcar Posição"}
                    </Button>

                    <div className="relative">
                      <img
                        src={event.floorPlanImageUrl}
                        alt="Planta do evento"
                        className={`w-full rounded-lg border ${
                          selectingPosition ? 'cursor-crosshair' : ''
                        }`}
                        onClick={handleFloorPlanClick}
                      />
                      {formData.positionX && formData.positionY && (
                        <div
                          className="absolute w-6 h-6 bg-blue-600 rounded-full border-4 border-white shadow-lg"
                          style={{
                            left: `${formData.positionX}%`,
                            top: `${formData.positionY}%`,
                            transform: 'translate(-50%, -50%)',
                          }}
                        />
                      )}
                    </div>

                    {formData.positionX && formData.positionY && (
                      <div className="text-sm text-gray-600">
                        Posição: X: {formData.positionX.toFixed(2)}%, Y: {formData.positionY.toFixed(2)}%
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Logo Upload */}
            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Logo do Expositor</CardTitle>
                  <CardDescription>
                    Faça upload do logo (PNG, JPG até 5MB)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="logo-upload"
                  />
                  
                  {logoPreview ? (
                    <div className="relative">
                      <div className="aspect-square w-full bg-gray-50 rounded-lg border flex items-center justify-center p-4">
                        <img
                          src={logoPreview}
                          alt="Preview do logo"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={handleRemoveLogo}
                        disabled={uploadingLogo}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      {uploadingLogo && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                          <Loader2 className="h-8 w-8 animate-spin text-white" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <label
                      htmlFor="logo-upload"
                      className="flex flex-col items-center justify-center aspect-square w-full border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <Upload className="h-12 w-12 text-gray-400 mb-3" />
                      <p className="text-sm text-gray-500 text-center px-4">
                        Clique para fazer upload do logo
                      </p>
                    </label>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-6">
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {isEdit ? "Atualizar Expositor" : "Criar Expositor"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/admin/eventos/${eventId}/expositores`)}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
