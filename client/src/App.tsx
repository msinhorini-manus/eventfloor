import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { storeManusSpaceDomain } from "@/lib/domainHelper";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import { useEffect } from "react";
import { APP_TITLE } from "./const";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { OAuthRedirectHandler } from "./components/OAuthRedirectHandler";
import Home from "./pages/Home";
import AdminDashboard from "./pages/admin/Dashboard";
import EventsList from "./pages/admin/EventsList";
import EventForm from "./pages/admin/EventForm";
import EventDetail from "./pages/admin/EventDetail";
import ExhibitorsList from "./pages/admin/ExhibitorsList";
import ExhibitorForm from "./pages/admin/ExhibitorForm";
import SponsorsList from "./pages/admin/patrocinadores/index";
import NovoPatrocinador from "./pages/admin/patrocinadores/novo";
import EditarPatrocinador from "./pages/admin/patrocinadores/[id]/editar";
import EventSponsors from "./pages/admin/EventSponsors";
import PublicEvent from "./pages/public/PublicEvent";
import AdminLogin from "./pages/AdminLogin";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path={"/"} component={Home} />
      
      {/* Admin routes - specific routes first */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/eventos" component={EventsList} />
      <Route path="/admin/eventos/novo" component={EventForm} />
      <Route path="/admin/eventos/:eventId/expositores/novo" component={ExhibitorForm} />
      <Route path="/admin/eventos/:eventId/expositores/:exhibitorId/editar" component={ExhibitorForm} />
      <Route path="/admin/eventos/:eventId/expositores" component={ExhibitorsList} />
      <Route path="/admin/eventos/:id/editar" component={EventForm} />
      <Route path="/admin/eventos/:id" component={EventDetail} />
      <Route path="/admin/patrocinadores" component={SponsorsList} />
      <Route path="/admin/patrocinadores/novo" component={NovoPatrocinador} />
      <Route path="/admin/patrocinadores/:id/editar" component={EditarPatrocinador} />
      <Route path="/admin/eventos/:id/patrocinadores" component={EventSponsors} />
      
      {/* Public event route - must come after all /admin routes */}
      <Route path="/:slug" component={PublicEvent} />
      
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    document.title = APP_TITLE;
    // Store .manus.space domain in localStorage for OAuth fallback
    storeManusSpaceDomain();
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <OAuthRedirectHandler />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
