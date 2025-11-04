import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import AdminDashboard from "./pages/admin/Dashboard";
import EventsList from "./pages/admin/EventsList";
import EventForm from "./pages/admin/EventForm";
import EventDetail from "./pages/admin/EventDetail";
import ExhibitorsList from "./pages/admin/ExhibitorsList";
import ExhibitorForm from "./pages/admin/ExhibitorForm";
import PublicEvent from "./pages/public/PublicEvent";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path={"/"} component={Home} />
      
      {/* Admin routes - specific routes first */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/eventos" component={EventsList} />
      <Route path="/admin/eventos/novo" component={EventForm} />
      <Route path="/admin/eventos/:eventId/expositores/novo" component={ExhibitorForm} />
      <Route path="/admin/eventos/:eventId/expositores/:exhibitorId/editar" component={ExhibitorForm} />
      <Route path="/admin/eventos/:eventId/expositores" component={ExhibitorsList} />
      <Route path="/admin/eventos/:id/editar" component={EventForm} />
      <Route path="/admin/eventos/:id" component={EventDetail} />
      
      {/* Public event route - must come after all /admin routes */}
      <Route path="/:slug" component={PublicEvent} />
      
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
