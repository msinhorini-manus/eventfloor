import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useParams, Link } from "wouter";
import { Calendar, MapPin, Loader2, Search, Home, ExternalLink } from "lucide-react";
import { APP_LOGO, APP_TITLE } from "@/const";
import { useState } from "react";
import ZoomableFloorPlan from "@/components/ZoomableFloorPlan";

export default function PublicEvent() {
  const params = useParams();
  const slug = params.slug!;
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExhibitor, setSelectedExhibitor] = useState<number | null>(null);

  const { data: event, isLoading: loadingEvent, error } = trpc.events.getBySlug.useQuery({ slug });
  const { data: exhibitors, isLoading: loadingExhibitors } = trpc.exhibitors.listByEventSlug.useQuery(
    { eventSlug: slug },
    { enabled: !!event }
  );

  const filteredExhibitors = exhibitors?.filter(ex =>
    ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.boothNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loadingEvent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Evento não encontrado</h2>
        <p className="text-gray-600 mb-6">O evento que você procura não existe ou não está publicado.</p>
        <Link href="/">
          <Button>
            <Home className="h-4 w-4 mr-2" />
            Voltar para Início
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center gap-3 cursor-pointer">
                {APP_LOGO && <img src={APP_LOGO} alt={APP_TITLE} className="h-10" />}
                <h1 className="text-xl font-bold text-gray-900">{APP_TITLE}</h1>
              </div>
            </Link>
            <Link href="/">
              <Button variant="outline" size="sm">
                <Home className="h-4 w-4 mr-2" />
                Todos os Eventos
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Event Header */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{event.name}</h2>
          <div className="flex flex-wrap items-center gap-4 text-gray-700">
            <span className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {new Date(event.dateStart).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </span>
            {event.location && (
              <span className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {event.location}
              </span>
            )}
          </div>
          {event.description && (
            <p className="text-gray-700 mt-4 max-w-3xl">{event.description}</p>
          )}
        </div>
      </section>

      {/* Main Content */}
      <section className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Floor Plan */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Planta do Evento</h3>
                  {event.floorPlanImageUrl ? (
                    <ZoomableFloorPlan
                      imageUrl={event.floorPlanImageUrl}
                      exhibitors={exhibitors?.filter(ex => ex.positionX && ex.positionY).map(ex => ({
                        id: ex.id,
                        name: ex.name,
                        logoUrl: ex.logoUrl ?? undefined,
                        positionX: ex.positionX!,
                        positionY: ex.positionY!,
                      })) || []}
                      onExhibitorClick={(id) => setSelectedExhibitor(selectedExhibitor === id ? null : id)}
                      showControls={true}
                    />
                  ) : (
                    <div className="bg-gray-100 rounded-lg p-12 text-center">
                      <p className="text-gray-600">Planta do evento em breve</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Exhibitors List */}
            <div>
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Expositores ({exhibitors?.length || 0})
                  </h3>
                  
                  {/* Search */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar expositor..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* List */}
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {loadingExhibitors ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                      </div>
                    ) : filteredExhibitors && filteredExhibitors.length > 0 ? (
                      filteredExhibitors.map((exhibitor) => (
                        <div
                          key={exhibitor.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedExhibitor === exhibitor.id
                              ? 'bg-blue-50 border-blue-300'
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedExhibitor(
                            selectedExhibitor === exhibitor.id ? null : exhibitor.id
                          )}
                        >
                          <div className="flex items-start gap-3">
                            {exhibitor.logoUrl ? (
                              <img 
                                src={exhibitor.logoUrl} 
                                alt={exhibitor.name}
                                className="w-12 h-12 object-contain rounded"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs font-bold">
                                {exhibitor.name.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 text-sm truncate">
                                {exhibitor.name}
                              </h4>
                              {exhibitor.category && (
                                <p className="text-xs text-gray-600">{exhibitor.category}</p>
                              )}
                              {exhibitor.boothNumber && (
                                <p className="text-xs text-gray-500">Stand: {exhibitor.boothNumber}</p>
                              )}
                            </div>
                          </div>
                          
                          {selectedExhibitor === exhibitor.id && exhibitor.description && (
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-sm text-gray-700">{exhibitor.description}</p>
                              {exhibitor.website && (
                                <a
                                  href={exhibitor.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-2"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  Visitar site
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-600 text-sm">
                          {searchTerm ? 'Nenhum expositor encontrado' : 'Nenhum expositor cadastrado'}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Portal ERP. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
