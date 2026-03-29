import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Receipt, 
  BarChart3, 
  Users, 
  Settings, 
  LogOut,
  RefreshCw,
  Menu,
  X
} from "lucide-react";
import { useGetBcvRate } from "@workspace/api-client-react";
import { cn, formatBs } from "@/lib/utils";
import { useState } from "react";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logoutUser } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: bcvRate, isLoading: isBcvLoading } = useGetBcvRate({
    request: { headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` } }
  });

  const adminLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/pos", label: "Punto de Venta", icon: ShoppingCart },
    { href: "/products", label: "Inventario", icon: Package },
    { href: "/sales", label: "Ventas", icon: Receipt },
    { href: "/reports", label: "Reportes", icon: BarChart3 },
    { href: "/users", label: "Usuarios", icon: Users },
    { href: "/bcv-config", label: "Tasa BCV", icon: Settings },
  ];

  const ownerLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/pos", label: "Punto de Venta", icon: ShoppingCart },
    { href: "/sales", label: "Ventas", icon: Receipt },
    { href: "/reports", label: "Reportes", icon: BarChart3 },
  ];

  const cashierLinks = [
    { href: "/pos", label: "Punto de Venta", icon: ShoppingCart },
  ];

  const links = user?.role === 'admin' ? adminLinks : user?.role === 'owner' ? ownerLinks : cashierLinks;

  return (
    <div className="min-h-screen bg-background flex w-full overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-sidebar border-r z-20">
        <div className="h-16 flex items-center px-6 border-b border-border/50">
          <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Logo" className="w-8 h-8 mr-3" />
          <span className="font-display font-bold text-lg text-sidebar-foreground">ERP Venezuela 🇻🇪</span>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const isActive = location === link.href;
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={cn(
                  "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <link.icon className={cn("w-5 h-5 mr-3 transition-transform group-hover:scale-110", isActive ? "text-primary-foreground" : "text-sidebar-foreground/50")} />
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border/50">
          <div className="flex items-center px-3 py-3 bg-secondary/50 rounded-lg mb-4">
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold mr-3 uppercase">
              {user?.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={logoutUser}
            className="flex w-full items-center px-3 py-2.5 text-sm font-medium text-destructive/80 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <aside className="relative w-64 flex-col bg-sidebar border-r flex animate-in slide-in-from-left">
            <div className="h-16 flex items-center justify-between px-4 border-b border-border/50">
              <span className="font-display font-bold text-lg">ERP 🇻🇪</span>
              <button onClick={() => setMobileMenuOpen(false)} className="text-muted-foreground p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 py-4 px-3 space-y-1">
              {links.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium",
                    location === link.href ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"
                  )}
                >
                  <link.icon className="w-5 h-5 mr-3" />
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t border-border/50">
               <button onClick={logoutUser} className="flex w-full items-center px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg">
                <LogOut className="w-5 h-5 mr-3" />
                Salir
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-background/80 backdrop-blur-md border-b border-border/50 flex items-center justify-between px-4 lg:px-8 z-10 sticky top-0">
          <div className="flex items-center">
            <button onClick={() => setMobileMenuOpen(true)} className="mr-4 md:hidden text-muted-foreground hover:text-foreground">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold font-display capitalize">
              {location.replace('/', '') || 'Dashboard'}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* BCV Badge */}
            <div className="flex items-center gap-2 bg-secondary/80 border border-secondary px-3 py-1.5 rounded-full shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-sm font-semibold tracking-wide flex items-center">
                BCV: 
                {isBcvLoading ? (
                  <RefreshCw className="w-3 h-3 ml-2 animate-spin text-muted-foreground" />
                ) : (
                  <span className="ml-1 text-emerald-400">{formatBs(bcvRate?.rate || 0)}</span>
                )}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
