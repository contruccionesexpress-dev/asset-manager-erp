import { useGetReportSummary, useGeneratePdfReport } from "@workspace/api-client-react";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@/components/ui/core";
import { formatUsd } from "@/lib/utils";
import { FileText, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#6366f1'];
const PM_LABELS: Record<string, string> = {
  cash_usd: "Divisa",
  cash_bs: "Efectivo Bs",
  mobile_payment: "Pago Móvil",
  point: "Punto de Venta",
  mixed: "Mixto"
};

export default function Reports() {
  const token = localStorage.getItem('auth_token');
  const { data: summary, isLoading } = useGetReportSummary({}, { request: { headers: { Authorization: `Bearer ${token}` } } });
  const { refetch: generatePdf, isFetching: isGenerating } = useGeneratePdfReport({}, { 
    query: { enabled: false },
    request: { headers: { Authorization: `Bearer ${token}` } }
  });

  const handleDownloadPDF = async () => {
    try {
      const res = await generatePdf();
      if (res.data) {
        const url = window.URL.createObjectURL(res.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Reporte_Ventas_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Cargando reportes...</div>;

  const pieData = summary?.salesByPaymentMethod?.map(item => ({
    name: PM_LABELS[item.method] || item.method,
    value: item.totalUsd
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-6 rounded-xl border shadow-lg">
        <div>
          <h2 className="text-2xl font-bold font-display">Reportes de Rendimiento</h2>
          <p className="text-muted-foreground">Análisis de ventas y ganancias</p>
        </div>
        <Button onClick={handleDownloadPDF} disabled={isGenerating} size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/25">
          <FileText className="w-5 h-5 mr-2" />
          {isGenerating ? "Generando..." : "Descargar PDF"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ventas por Día (Últimos 30 días)</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary?.salesByDay || []} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickFormatter={(val) => new Date(val).getDate().toString()} />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  cursor={{fill: '#1e293b'}} 
                  contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#f8fafc'}}
                  formatter={(value: number) => [formatUsd(value), "Ventas"]}
                />
                <Bar dataKey="totalUsd" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución por Método de Pago</CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#f8fafc'}}
                  formatter={(value: number) => formatUsd(value)}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
