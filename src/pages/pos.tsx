import { useState } from "react";
import { useListProducts, useCreateSale, useGetBcvRate } from "@workspace/api-client-react";
import { Button, Input, Card, Badge } from "@/components/ui/core";
import { formatUsd, formatBs } from "@/lib/utils";
import { Search, ShoppingCart, Plus, Minus, Trash2, Banknote, CreditCard, Smartphone } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";

export default function POS() {
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const token = localStorage.getItem('auth_token');
  const headers = { Authorization: `Bearer ${token}` };

  const { data: bcvRate } = useGetBcvRate({ request: { headers } });
  const { data: products } = useListProducts({ search: search || undefined }, { request: { headers } });
  const createSaleMut = useCreateSale({ request: { headers } });

  const { items, addItem, removeItem, updateQty, clearCart, totalUsd, totalBs, getSaleItems } = useCart(bcvRate?.rate || 1);
  const [paymentMethod, setPaymentMethod] = useState<"cash_usd" | "cash_bs" | "mobile_payment" | "point" | "mixed">("cash_usd");

  const handleCheckout = async () => {
    if (items.length === 0) return;
    try {
      await createSaleMut.mutateAsync({
        data: {
          items: getSaleItems(),
          paymentMethod,
        }
      });
      toast({ title: "Venta completada", description: "La venta se ha registrado exitosamente." });
      clearCart();
    } catch (e: any) {
      toast({ title: "Error en venta", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
      {/* Products Section */}
      <div className="flex-1 flex flex-col min-h-0 bg-card rounded-xl border overflow-hidden">
        <div className="p-4 border-b bg-secondary/30">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Buscar productos..." 
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {products?.map(p => (
              <div 
                key={p.id}
                onClick={() => addItem(p)}
                className={`relative p-4 rounded-xl border cursor-pointer transition-all hover:border-primary hover:shadow-lg hover:-translate-y-1 ${p.stock <= 0 ? 'opacity-50 grayscale' : 'bg-background'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="text-[10px]">{p.category || 'Varios'}</Badge>
                  {p.stock <= 0 && <Badge variant="destructive" className="text-[10px]">Agotado</Badge>}
                </div>
                <h4 className="font-semibold text-sm line-clamp-2 h-10 mb-2">{p.name}</h4>
                <div className="flex flex-col mt-auto">
                  <span className="text-emerald-400 font-bold">{formatUsd(p.priceUsd)}</span>
                  <span className="text-muted-foreground text-xs">{formatBs(p.priceBs)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-full lg:w-96 flex flex-col bg-card rounded-xl border shadow-xl flex-shrink-0">
        <div className="p-4 border-b flex items-center gap-2 bg-secondary/50">
          <ShoppingCart className="text-primary w-5 h-5" />
          <h3 className="font-bold font-display text-lg">Orden Actual</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
              <ShoppingCart className="w-12 h-12 mb-4 opacity-20" />
              <p>El carrito está vacío</p>
              <p className="text-sm">Selecciona productos para comenzar</p>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map(item => (
                <div key={item.id} className="flex flex-col p-3 bg-background rounded-lg border">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-sm pr-4">{item.name}</span>
                    <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex justify-between items-center mt-auto">
                    <div className="flex items-center gap-2 bg-secondary rounded-md p-1 border">
                      <button onClick={() => updateQty(item.id, item.cartQty - 1)} className="p-1 hover:bg-background rounded">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-semibold w-6 text-center">{item.cartQty}</span>
                      <button onClick={() => updateQty(item.id, item.cartQty + 1)} className="p-1 hover:bg-background rounded">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-400">{formatUsd(item.priceUsd * item.cartQty)}</div>
                      <div className="text-xs text-muted-foreground">{formatBs(item.priceBs * item.cartQty)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-secondary/20">
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatUsd(totalUsd)}</span>
            </div>
            <div className="flex justify-between items-end border-t pt-3">
              <span className="font-bold">Total Pagar</span>
              <div className="text-right">
                <div className="text-2xl font-bold font-display text-emerald-400">{formatUsd(totalUsd)}</div>
                <div className="text-sm font-medium text-muted-foreground">{formatBs(totalBs)}</div>
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Método de Pago</label>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant={paymentMethod === 'cash_usd' ? 'default' : 'outline'} 
                className="h-10 text-xs" 
                onClick={() => setPaymentMethod('cash_usd')}
              >
                <DollarSign className="w-4 h-4 mr-2" /> Divisa
              </Button>
              <Button 
                variant={paymentMethod === 'cash_bs' ? 'default' : 'outline'} 
                className="h-10 text-xs"
                onClick={() => setPaymentMethod('cash_bs')}
              >
                <Banknote className="w-4 h-4 mr-2" /> Efectivo Bs
              </Button>
              <Button 
                variant={paymentMethod === 'mobile_payment' ? 'default' : 'outline'} 
                className="h-10 text-xs"
                onClick={() => setPaymentMethod('mobile_payment')}
              >
                <Smartphone className="w-4 h-4 mr-2" /> Pago Móvil
              </Button>
              <Button 
                variant={paymentMethod === 'point' ? 'default' : 'outline'} 
                className="h-10 text-xs"
                onClick={() => setPaymentMethod('point')}
              >
                <CreditCard className="w-4 h-4 mr-2" /> Punto
              </Button>
            </div>
          </div>

          <Button 
            className="w-full h-14 text-lg font-bold shadow-xl" 
            disabled={items.length === 0 || createSaleMut.isPending}
            onClick={handleCheckout}
          >
            {createSaleMut.isPending ? "Procesando..." : "Completar Venta"}
          </Button>
        </div>
      </div>
    </div>
  );
}
