import { useState } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cartApi, type ICartItem } from "@/lib/api/";
import type { KeyedMutator } from "swr";

type Props = {
  productId: string;
  isInCart: boolean;
  qty: number;
  refreshCart: KeyedMutator<ICartItem[]>;
};

export function V3CartActionButton({ productId, isInCart, qty, refreshCart }: Props) {
  const [pending, setPending] = useState(false);

  const handleAdd = async () => {
    if (pending) return;

    setPending(true);

    try {
      const res = await cartApi.addToCart(productId, 1);
      refreshCart(res.data.cart);
    } catch (error) {
      toast({
        title: "Failed",
        description: error instanceof Error ? error.message : "Unable to add to cart",
        variant: "destructive",
      });
    } finally {
      setPending(false);
    }
  };

  const changeQty = async (delta: number) => {
    if (pending) return;

    setPending(true);
    const newQty = qty + delta;

    try {
      if (newQty > 0) {
        const res = await cartApi.updateCartItem(productId, newQty);
        refreshCart(res.data.cart);
      } else {
        await cartApi.clearCart();
        refreshCart([])
      }
    } catch (error) {
      toast({
        title: "Failed",
        description: error instanceof Error ? error.message : "Unable to update cart",
        variant: "destructive",
      });
    } finally {
      setPending(false);
    }
  };

  if (!isInCart) {
    return (
      <button
        disabled={pending}
        onClick={handleAdd}
        className="flex-shrink-0 h-11 w-11 rounded-full flex items-center justify-center bg-ink/[0.06] hover:bg-print-orange/20 text-ink transition-all disabled:opacity-50"
        aria-label="Add to cart"
      >
        {pending ? (
          <div className="h-4 w-4 border-2 border-ink/30 border-t-ink rounded-full animate-spin" />
        ) : (
          <ShoppingCart className="h-4 w-4" />
        )}
      </button>
    );
  }

  return (
    <div className="flex items-center border-2 border-print-red opacity-100 transition-all duration-200">
      <button
        disabled={pending}
        onClick={() => changeQty(-1)}
        className="h-9 w-9 flex items-center justify-center text-print-red hover:bg-print-red hover:text-paper transition-colors"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>

      <span className="w-8 text-center font-mono-display text-xs text-print-red">{qty}</span>

      <button
        disabled={pending}
        onClick={() => changeQty(1)}
        className="h-9 w-9 flex items-center justify-center text-print-red hover:bg-print-red hover:text-paper transition-colors"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
