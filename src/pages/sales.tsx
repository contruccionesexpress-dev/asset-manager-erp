import { useListSales } from "@workspace/api-client-react";
import { Card, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Badge } from "@/components/ui/core";
import { formatUsd, formatBs, formatDate } from "@/lib/utils";

const PM_LABELS: Record<string, string> = {
  cash_usd: "Divisa",
  cash_bs: "Efectivo Bs",
  mobile_payment: "Pago Móvil",
  point: "Punto de Venta",
  mixed: "Mixto"
};

export default function Sales() {
  const token = localStorage.getItem('auth_token');
  const { data: sales, isLoading } = useListSales({}, { request: { headers: { Authorization: `Bearer ${token}` } } });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold font-display">Historial de Ventas</h2>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/50">
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>ID Venta</TableHead>
              <TableHead>Método de Pago</TableHead>
              <TableHead>Cajero</TableHead>
              <TableHead className="text-right">Monto (USD)</TableHead>
              <TableHead className="text-right">Monto (Bs)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">Cargando...</TableCell></TableRow>
            ) : sales?.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No hay ventas registradas</TableCell></TableRow>
            ) : (
              sales?.map(sale => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium">{formatDate(sale.createdAt)}</TableCell>
                  <TableCell className="text-muted-foreground"># {sale.id.toString().padStart(6, '0')}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-background">{PM_LABELS[sale.paymentMethod] || sale.paymentMethod}</Badge>
                  </TableCell>
                  <TableCell>{sale.cashierName}</TableCell>
                  <TableCell className="text-right font-bold text-emerald-400">{formatUsd(sale.totalUsd)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{formatBs(sale.totalBs)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
