import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Plus } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { formatShortDate } from "@/lib/dateUtils";

export default function AdminDashboard() {
  const { data: events, isLoading } = trpc.events.listAll.useQuery();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
            <p className="text-gray-600 mt-1">Gerencie os eventos do Portal ERP</p>
          </div>
          <Link href="/admin/eventos/novo">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Evento
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total de Eventos</CardDescription>
              <CardTitle className="text-4xl">
                {events?.length || 0}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Eventos Publicados</CardDescription>
              <CardTitle className="text-4xl">
                {events?.filter(e => e.status === 'published').length || 0}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Rascunhos</CardDescription>
              <CardTitle className="text-4xl">
                {events?.filter(e => e.status === 'draft').length || 0}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Recent Events */}
        <Card>
          <CardHeader>
            <CardTitle>Eventos Recentes</CardTitle>
            <CardDescription>Últimos eventos criados</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex items-center gap-4 p-4 border rounded-lg">
                    <div className="h-16 w-16 bg-gray-200 rounded"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : events && events.length > 0 ? (
              <div className="space-y-4">
                {events.slice(0, 5).map((event) => (
                  <Link key={event.id} href={`/admin/eventos/${event.id}`}>
                    <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      {event.floorPlanImageUrl ? (
                        <img 
                          src={event.floorPlanImageUrl} 
                          alt={event.name}
                          className="h-16 w-16 object-cover rounded"
                        />
                      ) : (
                        <div className="h-16 w-16 bg-gray-200 rounded flex items-center justify-center">
                          <Calendar className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{event.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatShortDate(event.dateStart, 'pt-BR')}
                          </span>
                          {event.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {event.location}
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
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
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-700 mb-2">
                  Nenhum evento criado
                </h4>
                <p className="text-gray-600 mb-4">
                  Comece criando seu primeiro evento
                </p>
                <Link href="/admin/eventos/novo">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Evento
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
