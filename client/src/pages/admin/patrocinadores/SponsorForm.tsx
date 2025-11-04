import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { ArrowLeft, Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

interface SponsorFormProps {
  sponsorId?: number;
}

const tierOptions = [
  { value: "diamond", label: "Diamante" },
  { value: "gold", label: "Ouro" },
  { value: "silver", label: "Prata" },
  { value: "bronze", label: "Bronze" },
];

export default function SponsorForm({ sponsorId }: SponsorFormProps) {
  const [, setLocation] = useLocation();
  const isEditing = !!sponsorId;

  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [tier, setTier] = useState<"diamond" | "gold" | "silver" | "bronze">("gold");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [logoUrl, setLogoUrl] = useState("");
  const [logoKey, setLogoKey] = useState("");
  const [uploading, setUploading] = useState(false);

  // Fetch sponsor data if editing
  const { data: sponsor, isLoading: loadingSponsor } = trpc.sponsors.getById.useQuery(
    { id: sponsorId! },
    { enabled: isEditing }
  );

  const uploadMutation = trpc.upload.uploadSponsorLogo.useMutation();
  const createMutation = trpc.sponsors.create.useMutation({
    onSuccess: () => {
      toast.success("Patrocinador criado com sucesso!");
      setLocation("/admin/patrocinadores");
    },
    onError: (error) => {
      toast.error(`Erro ao criar patrocinador: ${error.message}`);
    },
  });

  const updateMutation = trpc.sponsors.update.useMutation({
    onSuccess: () => {
      toast.success("Patrocinador atualizado com sucesso!");
      setLocation("/admin/patrocinadores");
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar patrocinador: ${error.message}`);
    },
  });

  useEffect(() => {
    if (sponsor) {
      setName(sponsor.name);
      setWebsite(sponsor.website || "");
      setDescription(sponsor.description || "");
      setTier(sponsor.tier);
      setDisplayOrder(sponsor.displayOrder);
      setIsActive(sponsor.isActive);
      setLogoUrl(sponsor.logoUrl || "");
      setLogoKey(sponsor.logoKey || "");
    }
  }, [sponsor]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem válida");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        // Remove data URL prefix
        const base64Data = base64.split(',')[1];
        const result = await uploadMutation.mutateAsync({
          fileData: base64Data,
          fileName: file.name,
          mimeType: file.type,
        });
        setLogoUrl(result.url);
        setLogoKey(result.key);
        toast.success("Logo enviado com sucesso!");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Erro ao enviar logo");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoUrl("");
    setLogoKey("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Por favor, preencha o nome do patrocinador");
      return;
    }

    const data = {
      name: name.trim(),
      website: website.trim() || undefined,
      description: description.trim() || undefined,
      tier,
      displayOrder,
      isActive,
      logoUrl: logoUrl || undefined,
      logoKey: logoKey || undefined,
    };

    if (isEditing) {
      updateMutation.mutate({ id: sponsorId!, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (loadingSponsor) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/admin/patrocinadores")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEditing ? "Editar Patrocinador" : "Novo Patrocinador"}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditing ? "Atualize as informações do patrocinador" : "Adicione um novo patrocinador"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informações do Patrocinador</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Logo Upload */}
            <div className="space-y-2">
              <Label>Logo do Patrocinador</Label>
              {logoUrl ? (
                <div className="relative inline-block">
                  <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
                    <img src={logoUrl} alt="Logo preview" className="max-h-32 max-w-full object-contain" />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2"
                    onClick={handleRemoveLogo}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                    disabled={uploading}
                  />
                  <label htmlFor="logo-upload" className="cursor-pointer">
                    {uploading ? (
                      <Loader2 className="h-12 w-12 mx-auto text-gray-400 animate-spin" />
                    ) : (
                      <Upload className="h-12 w-12 mx-auto text-gray-400" />
                    )}
                    <p className="mt-2 text-sm text-gray-600">
                      {uploading ? "Enviando..." : "Clique para fazer upload do logo"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG até 5MB</p>
                  </label>
                </div>
              )}
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Patrocinador *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Empresa XYZ"
                required
              />
            </div>

            {/* Tier */}
            <div className="space-y-2">
              <Label htmlFor="tier">Nível de Patrocínio *</Label>
              <Select value={tier} onValueChange={(value: any) => setTier(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o nível" />
                </SelectTrigger>
                <SelectContent>
                  {tierOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Website */}
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://exemplo.com"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Breve descrição sobre o patrocinador..."
                rows={4}
              />
            </div>

            {/* Display Order */}
            <div className="space-y-2">
              <Label htmlFor="displayOrder">Ordem de Exibição</Label>
              <Input
                id="displayOrder"
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                placeholder="0"
              />
              <p className="text-xs text-gray-500">Números menores aparecem primeiro</p>
            </div>

            {/* Is Active */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={isActive}
                onCheckedChange={(checked) => setIsActive(checked as boolean)}
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Patrocinador ativo (visível na página pública)
              </Label>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>{isEditing ? "Atualizar" : "Criar"} Patrocinador</>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/admin/patrocinadores")}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
