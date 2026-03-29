import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui/core";
import { useGetReportSummary } from "@workspace/api-client-react";
import { formatBs, formatUsd } from "@/lib/utils";
import { DollarSign, Wallet, Activity, AlertTriangle, ArrowRight, Package, Receipt, BarChart3 } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const token = localStorage.getItem('auth_token');
  const { data: summary, isLoading } = useGetReportSummary(
    {}, // no params = today by default usually, or all time depending on backend. We assume backend returns general summary
    { request: { headers: { Authorization: `Bearer ${token}` } } }
  );

  if (isLoading) return <div className="flex h-full items-center justify-center text-muted-foreground">Cargando dashboard...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ventas Hoy (USD)</CardTitle>
            <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-display">{formatUsd(summary?.totalSalesUsd || 0)}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ventas Hoy (Bs)</CardTitle>
            <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400">
              <Wallet className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-display">{formatBs(summary?.totalSalesBs || 0)}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Transacciones</CardTitle>
            <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400">
              <Activity className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-display">{summary?.totalTransactions || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/50 border-destructive/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-destructive-foreground">Alertas de Stock</CardTitle>
            <div className="w-8 h-8 bg-destructive/20 rounded-full flex items-center justify-center text-destructive">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-display text-destructive">{summary?.lowStockCount || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card className="overflow-hidden">
          <CardHeader className="bg-secondary/30">
            <CardTitle>Accesos Rápidos</CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-2 gap-4">
            <Button asChild size="lg" className="h-24 flex flex-col gap-2 shadow-lg shadow-primary/20">
              <Link href="/pos">
                <DollarSign className="w-6 h-6" />
                <span>Punto de Venta</span>
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="h-24 flex flex-col gap-2">
              <Link href="/products">
                <Package className="w-6 h-6" />
                <span>Gestionar Inventario</span>
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="h-24 flex flex-col gap-2">
              <Link href="/sales">
                <Receipt className="w-6 h-6" />
                <span>Historial Ventas</span>
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="h-24 flex flex-col gap-2">
              <Link href="/reports">
                <BarChart3 className="w-6 h-6" />
                <span>Ver Reportes</span>
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Productos Más Vendidos
              <Link href="/reports" className="text-sm font-normal text-primary flex items-center hover:underline">
                Ver todos <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summary?.topProducts?.map((p, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div>
                    <p className="font-semibold text-foreground">{p.productName}</p>
                    <p className="text-sm text-muted-foreground">{p.totalQuantity} vendidos</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-400">{formatUsd(p.totalUsd)}</p>
                  </div>
                </div>
              ))}
              {(!summary?.topProducts || summary.topProducts.length === 0) && (
                <p className="text-muted-foreground text-center py-4">No hay datos suficientes</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
