import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Users } from "lucide-react";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Home() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const { data: events, isLoading } = trpc.events.listPublished.useQuery();

  // Separar eventos em breve (próximos 30 dias) e outros eventos
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  const upcomingEvents = events?.filter(event => {
    const eventDate = new Date(event.dateStart);
    return eventDate >= now && eventDate <= thirtyDaysFromNow;
  }).sort((a, b) => new Date(a.dateStart).getTime() - new Date(b.dateStart).getTime());

  const otherEvents = events?.filter(event => {
    const eventDate = new Date(event.dateStart);
    return eventDate > thirtyDaysFromNow;
  }).sort((a, b) => new Date(a.dateStart).getTime() - new Date(b.dateStart).getTime());

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header - ERP Summit Style */}
      <header className="bg-[#0a1628] border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {APP_LOGO && <img src={APP_LOGO} alt={APP_TITLE} className="h-10" />}
            <h1 className="text-2xl font-bold text-white">{APP_TITLE}</h1>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            {isAuthenticated ? (
              <>
                {user?.role === 'admin' && (
                  <Link href="/admin">
                    <Button variant="outline" className="border-[#f59e0b] text-[#f59e0b] hover:bg-[#f59e0b] hover:text-white">{t('home.adminArea')}</Button>
                  </Link>
                )}
                <span className="text-sm text-white">Olá, {user?.name}</span>
              </>
            ) : (
              <Button asChild className="bg-[#f59e0b] hover:bg-[#ff8c00] text-white">
                <a href={getLoginUrl()}>Login</a>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section - ERP Summit Style com gradiente azul escuro */}
      <section className="bg-gradient-to-br from-[#0a1628] via-[#0f2137] to-[#142a46] py-20 relative overflow-hidden">
        {/* Linhas geométricas decorativas */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500 rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {t('home.title')}
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            {t('home.subtitle')}
          </p>
        </div>
      </section>

      {/* Upcoming Events Section */}
      {!isLoading && upcomingEvents && upcomingEvents.length > 0 && (
        <section className="py-12 bg-gradient-to-br from-orange-50 to-red-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-1 bg-orange-500 rounded"></div>
              <h3 className="text-3xl font-bold text-gray-900">{t('home.upcomingEvents')}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <Link key={event.id} href={`/${event.slug}`}>
                  <Card className="hover:shadow-xl transition-all duration-300 ease-in-out cursor-pointer h-full border-2 border-orange-200 hover:border-orange-400 hover:scale-105">
                    <div className="relative">
                      {event.floorPlanImageUrl && (
                        <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                          <img 
                            src={event.floorPlanImageUrl} 
                            alt={event.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        {t('home.comingSoon')}
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-xl">{event.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 text-sm font-medium text-orange-600">
                        <Calendar className="h-4 w-4" />
                        {new Date(event.dateStart).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {event.location && (
                        <p className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </p>
                      )}
                      {event.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Events List - ERP Summit Style */}
      <section className="py-16 bg-[#0a1628]">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-white mb-8">{t('home.allEvents')}</h3>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : otherEvents && otherEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherEvents.map((event) => (
                <Link key={event.id} href={`/${event.slug}`}>
                  <Card className="hover:shadow-lg transition-all duration-300 ease-in-out cursor-pointer h-full hover:scale-105 bg-card/80 hover:bg-card border border-border hover:border-primary/50">
                    {event.floorPlanImageUrl && (
                      <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                        <img 
                          src={event.floorPlanImageUrl} 
                          alt={event.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-xl">{event.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        {new Date(event.dateStart).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {event.location && (
                        <p className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </p>
                      )}
                      {event.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-gray-700 mb-2">
                  {t('common.noResults')}
                </h4>
                <p className="text-gray-600">
                  {t('home.subtitle')}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Footer - ERP Summit Style */}
      <footer className="bg-[#050d18] text-white py-8 mt-auto border-t border-white/10">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            {t('footer.rights', { year: new Date().getFullYear() })}
          </p>
        </div>
      </footer>
    </div>
  );
}
