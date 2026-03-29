import { useState } from "react";
import { useGetBcvRate, useSetManualBcvRate, useRefreshBcvRate } from "@workspace/api-client-react";
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Badge } from "@/components/ui/core";
import { formatBs, formatDate } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Edit2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function BcvConfig() {
  const token = localStorage.getItem('auth_token');
  const headers = { Authorization: `Bearer ${token}` };
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: bcv, isLoading } = useGetBcvRate({ request: { headers } });
  const refreshMut = useRefreshBcvRate({ request: { headers } });
  const manualMut = useSetManualBcvRate({ request: { headers } });

  const [manualRate, setManualRate] = useState("");

  const handleRefresh = async () => {
    try {
      await refreshMut.mutateAsync();
      queryClient.invalidateQueries({ queryKey: ["/api/bcv/rate"] });
      toast({ title: "Tasa actualizada exitosamente desde el BCV" });
    } catch (e: any) {
      toast({ title: "Error actualizando tasa", description: e.message, variant: "destructive" });
    }
  };

  const handleSaveManual = async () => {
    const rate = parseFloat(manualRate);
    if (isNaN(rate) || rate <= 0) return toast({ title: "Tasa inválida", variant: "destructive" });
    
    try {
      await manualMut.mutateAsync({ data: { rate } });
      queryClient.invalidateQueries({ queryKey: ["/api/bcv/rate"] });
      setManualRate("");
      toast({ title: "Tasa manual establecida" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-display">Configuración Tasa Cambiaria</h2>
        <p className="text-muted-foreground">Controla el valor del dólar para el cálculo de precios</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-card to-card/40 border-primary/20 shadow-xl shadow-primary/5">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Tasa Actual
              {bcv?.source === 'automatic' ? (
                <Badge variant="success">BCV Oficial</Badge>
              ) : (
                <Badge variant="outline" className="text-orange-400 border-orange-400/30 bg-orange-400/10">Manual</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-5xl font-black font-display text-emerald-400">
              {isLoading ? "..." : formatBs(bcv?.rate || 0)}
            </div>
            <div className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 text-primary" />
              <div>
                <p>Última actualización:</p>
                <p className="font-medium text-foreground">{formatDate(bcv?.updatedAt)}</p>
              </div>
            </div>
            <Button 
              className="w-full" 
              onClick={handleRefresh} 
              disabled={refreshMut.isPending}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshMut.isPending ? 'animate-spin' : ''}`} />
              {refreshMut.isPending ? "Obteniendo del BCV..." : "Forzar actualización BCV"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-muted-foreground" /> Override Manual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              En caso de fallo de conexión con el BCV, puedes establecer la tasa manualmente. Esto cambiará la fuente a "Manual".
            </p>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nueva Tasa (Bs/$)</label>
                <Input 
                  type="number" 
                  step="0.01" 
                  placeholder="Ej: 36.50"
                  value={manualRate}
                  onChange={(e) => setManualRate(e.target.value)}
                />
              </div>
              <Button 
                variant="secondary" 
                className="w-full"
                onClick={handleSaveManual}
                disabled={!manualRate || manualMut.isPending}
              >
                Aplicar Tasa Manual
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
