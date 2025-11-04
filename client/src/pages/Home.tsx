import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Users } from "lucide-react";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const { data: events, isLoading } = trpc.events.listPublished.useQuery();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {APP_LOGO && <img src={APP_LOGO} alt={APP_TITLE} className="h-10" />}
            <h1 className="text-2xl font-bold text-gray-900">{APP_TITLE}</h1>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {user?.role === 'admin' && (
                  <Link href="/admin">
                    <Button variant="outline">Área Admin</Button>
                  </Link>
                )}
                <span className="text-sm text-gray-600">Olá, {user?.name}</span>
              </>
            ) : (
              <Button asChild>
                <a href={getLoginUrl()}>Login</a>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Explore Nossos Eventos
          </h2>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Navegue pelas plantas interativas dos eventos do Portal ERP e descubra expositores, 
            palestras e oportunidades de networking.
          </p>
        </div>
      </section>

      {/* Events List */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-gray-900 mb-8">Eventos Disponíveis</h3>
          
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
          ) : events && events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Link key={event.id} href={`/${event.slug}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
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
                  Nenhum evento disponível
                </h4>
                <p className="text-gray-600">
                  Novos eventos serão publicados em breve.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} Portal ERP. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
