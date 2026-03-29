import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { useGetTrialStatus } from "@workspace/api-client-react";

import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Products from "@/pages/products";
import POS from "@/pages/pos";
import Sales from "@/pages/sales";
import Reports from "@/pages/reports";
import Users from "@/pages/users";
import BcvConfig from "@/pages/bcv-config";

const queryClient = new QueryClient();

function TrialGate({ children }: { children: React.ReactNode }) {
  const { data: trial, isLoading } = useGetTrialStatus({
    query: { retry: false }
  });

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center text-foreground">Iniciando sistema...</div>;

  if (trial?.expired) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card rounded-2xl p-8 border shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 bg-destructive/20 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </div>
          <h1 className="text-3xl font-black font-display text-foreground">Licencia Expirada</h1>
          <p className="text-muted-foreground">Tu periodo de prueba o licencia comercial ha finalizado. El acceso al sistema está bloqueado.</p>
          <a 
            href="https://wa.me/584141234567" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 rounded-xl font-bold transition-colors shadow-lg shadow-[#25D366]/20"
          >
            Contactar por WhatsApp
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function ProtectedRoute({ component: Component, allowedRoles }: { component: React.ComponentType, allowedRoles?: string[] }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div className="min-h-screen bg-background" />;
  if (!user) {
    window.location.href = '/login';
    return null;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <Layout>
        <div className="h-full flex items-center justify-center flex-col text-center">
          <h2 className="text-2xl font-bold mb-2">Acceso Denegado</h2>
          <p className="text-muted-foreground">No tienes permisos para ver esta página.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Component />
    </Layout>
  );
}

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      {/* Protected Routes */}
      <Route path="/" component={() => {
        if (!user) window.location.href = '/login';
        else window.location.href = user.role === 'cashier' ? '/pos' : '/dashboard';
        return null;
      }} />
      <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} allowedRoles={['admin', 'owner']} />} />
      <Route path="/products" component={() => <ProtectedRoute component={Products} allowedRoles={['admin']} />} />
      <Route path="/pos" component={() => <ProtectedRoute component={POS} />} />
      <Route path="/sales" component={() => <ProtectedRoute component={Sales} allowedRoles={['admin', 'owner']} />} />
      <Route path="/reports" component={() => <ProtectedRoute component={Reports} allowedRoles={['admin', 'owner']} />} />
      <Route path="/users" component={() => <ProtectedRoute component={Users} allowedRoles={['admin']} />} />
      <Route path="/bcv-config" component={() => <ProtectedRoute component={BcvConfig} allowedRoles={['admin']} />} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <TrialGate>
          <AuthProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </AuthProvider>
        </TrialGate>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
