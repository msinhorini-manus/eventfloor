import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useParams, Link } from "wouter";
import { Calendar, MapPin, Loader2, Search, Home, ExternalLink } from "lucide-react";
import { APP_LOGO, APP_TITLE } from "@/const";
import { useState } from "react";
import ZoomableFloorPlan from "@/components/ZoomableFloorPlan";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ExhibitorDrawer from "@/components/ExhibitorDrawer";
import EventSponsorsSection from "@/components/EventSponsorsSection";
import { formatEventDate, formatDateRange } from "@/lib/dateUtils";

export default function PublicEvent() {
  const { t } = useTranslation();
  const params = useParams();
  const slug = params.slug!;
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExhibitor, setSelectedExhibitor] = useState<number | null>(null);
  const [hoveredExhibitor, setHoveredExhibitor] = useState<number | null>(null);

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
      <div className="min-h-screen flex items-center justify-center bg-[#0a1628]">
        <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a1628]">
        <h2 className="text-2xl font-bold text-white mb-4">{t('event.notFound')}</h2>
        <p className="text-gray-300 mb-6">{t('event.notFoundMessage')}</p>
        <Link href="/">
          <Button>
            <Home className="h-4 w-4 mr-2" />
            {t('home.allEvents')}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0a1628]">
      {/* Header */}
      <header className="bg-[#0f1f3a] border-b border-gray-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center gap-2 md:gap-3 cursor-pointer">
                {APP_LOGO && <img src={APP_LOGO} alt={APP_TITLE} className="h-8 md:h-10" />}
                <h1 className="text-base md:text-xl font-bold text-white">{APP_TITLE}</h1>
              </div>
            </Link>
            <div className="flex items-center gap-2 md:gap-3">
              <LanguageSwitcher />
              <Link href="/">
                <Button variant="outline" size="sm" className="border-gray-700 text-white hover:bg-gray-800">
                  <Home className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">{t('home.allEvents')}</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Event Header */}
      <section className="bg-gradient-to-br from-[#0f1f3a] to-[#1a2f4a] py-6 md:py-12 border-b border-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-3 md:mb-4">{event.name}</h2>
          <div className="flex flex-wrap items-center gap-3 md:gap-4 text-sm md:text-base text-gray-300">
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4 md:h-5 md:w-5" />
              {formatDateRange(event.dateStart, event.dateEnd, 'pt-BR')}
            </span>
            {event.location && (
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 md:h-5 md:w-5" />
                {event.location}
              </span>
            )}
          </div>
          {event.description && (
            <p className="text-sm md:text-base text-gray-300 mt-3 md:mt-4 max-w-3xl">{event.description}</p>
          )}
        </div>
      </section>

      {/* Main Content */}
      <section className="flex-1 py-4 md:py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
            {/* Floor Plan - Maior destaque */}
            <div className="lg:col-span-3">
              <Card className="bg-[#0f1f3a] border-gray-800 card-border-gradient">
                <CardContent className="p-4 md:p-6">
                  <h3 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4">{t('event.floorPlan')}</h3>
                  {event.floorPlanImageUrl ? (
                    <ZoomableFloorPlan
                      imageUrl={event.floorPlanImageUrl}
                      exhibitors={exhibitors?.filter(ex => ex.positionX && ex.positionY).map(ex => ({
                        id: ex.id,
                        name: ex.name,
                        logoUrl: ex.logoUrl ?? undefined,
                        positionX: ex.positionX!,
                        positionY: ex.positionY!,
                        category: ex.category,
                        description: ex.description,
                        website: ex.website,
                        boothNumber: ex.boothNumber,
                      })) || []}
                      onExhibitorClick={(id) => setSelectedExhibitor(selectedExhibitor === id ? null : id)}
                      showControls={true}
                      hoveredExhibitorId={hoveredExhibitor}
                      focusedExhibitorId={selectedExhibitor}
                    />
                  ) : (
                    <div className="bg-gray-800 rounded-lg p-12 text-center">
                      <p className="text-gray-400">{t('event.floorPlanSoon')}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Exhibitors List */}
            <div>
              <Card className="lg:sticky lg:top-24 bg-[#0f1f3a] border-gray-800 card-border-gradient">
                <CardContent className="p-4 md:p-6">
                  <h3 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4">
                    {t('event.exhibitors')} ({exhibitors?.length || 0})
                  </h3>
                  
                  {/* Search */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder={t('event.searchExhibitor')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
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
                          className={`p-3 border rounded-lg cursor-pointer transition-all duration-300 ${
                            selectedExhibitor === exhibitor.id
                              ? 'bg-[#c8ff00]/30 border-[#c8ff00] shadow-lg shadow-[#c8ff00]/20'
                              : hoveredExhibitor === exhibitor.id
                              ? 'bg-yellow-500/20 border-yellow-400 shadow-lg'
                              : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                          }`}
                          onClick={() => setSelectedExhibitor(
                            selectedExhibitor === exhibitor.id ? null : exhibitor.id
                          )}
                          onMouseEnter={() => setHoveredExhibitor(exhibitor.id)}
                          onMouseLeave={() => setHoveredExhibitor(null)}
                        >
                          <div className="flex items-start gap-3">
                            {exhibitor.logoUrl ? (
                              <img 
                                src={exhibitor.logoUrl} 
                                alt={exhibitor.name}
                                className="w-12 h-12 object-contain rounded"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center text-gray-400 text-xs font-bold">
                                {exhibitor.name.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-white text-sm truncate">
                                {exhibitor.name}
                              </h4>
                              {exhibitor.category && (
                                <p className="text-xs text-gray-400">{exhibitor.category}</p>
                              )}
                              {exhibitor.boothNumber && (
                                <p className="text-xs text-gray-500">{t('event.booth')}: {exhibitor.boothNumber}</p>
                              )}
                            </div>
                          </div>
                          
                          {selectedExhibitor === exhibitor.id && exhibitor.description && (
                            <div className="mt-3 pt-3 border-t border-gray-700">
                              <p className="text-sm text-gray-300">{exhibitor.description}</p>
                              {exhibitor.website && (
                                <a
                                  href={exhibitor.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-sm text-[#c8ff00] hover:text-[#d4ff00] mt-2 transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  {t('event.visitWebsite')}
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-400 text-sm">
                          {searchTerm ? t('event.noExhibitorsFound') : t('event.noExhibitors')}
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

      {/* Event Sponsors Section */}
      <EventSponsorsSection eventSlug={slug} />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            {t('footer.rights', { year: new Date().getFullYear() })}
          </p>
        </div>
      </footer>

      {/* Exhibitor Drawer */}
      {selectedExhibitor && exhibitors && (
        <ExhibitorDrawer
          exhibitor={exhibitors.find(ex => ex.id === selectedExhibitor)!}
          onClose={() => setSelectedExhibitor(null)}
        />
      )}
    </div>
  );
}
