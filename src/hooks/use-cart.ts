import { useState, useMemo } from "react";
import { Product, SaleItemRequest } from "@workspace/api-client-react";

export interface CartItem extends Product {
  cartQty: number;
}

export function useCart(bcvRate: number = 1) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (product: Product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        if (existing.cartQty >= product.stock) return prev; // Do not exceed stock
        return prev.map((i) =>
          i.id === product.id ? { ...i, cartQty: i.cartQty + 1 } : i
        );
      }
      if (product.stock <= 0) return prev;
      return [...prev, { ...product, cartQty: 1 }];
    });
  };

  const removeItem = (productId: number) => {
    setItems((prev) => prev.filter((i) => i.id !== productId));
  };

  const updateQty = (productId: number, qty: number) => {
    if (qty <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => {
        if (i.id === productId) {
          const validQty = Math.min(qty, i.stock);
          return { ...i, cartQty: validQty };
        }
        return i;
      })
    );
  };

  const clearCart = () => setItems([]);

  const totals = useMemo(() => {
    const totalUsd = items.reduce((sum, i) => sum + i.priceUsd * i.cartQty, 0);
    const totalBs = totalUsd * bcvRate;
    const itemCount = items.reduce((sum, i) => sum + i.cartQty, 0);
    return { totalUsd, totalBs, itemCount };
  }, [items, bcvRate]);

  const getSaleItems = (): SaleItemRequest[] => {
    return items.map((i) => ({ productId: i.id, quantity: i.cartQty }));
  };

  return {
    items,
    addItem,
    removeItem,
    updateQty,
    clearCart,
    ...totals,
    getSaleItems,
  };
}
