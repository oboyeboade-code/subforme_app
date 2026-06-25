import { useState } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cartApi, type ICartItem  } from "@/lib/api/";
import type { KeyedMutator } from "swr";

type Props = {
  productId: string;
  isInCart: boolean;
  qty: number;
  refreshCart: KeyedMutator<ICartItem[]>;
};

export function CartActionButton({ productId, isInCart, qty, refreshCart }: Props) {
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
        description: error instanceof Error ? error.message : "Unable to update cart",
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
      if (newQty < 1) {
        await cartApi.removeFromCart(productId);
        refreshCart([]);
      } else {
        const res = await cartApi.updateCartItem(productId, newQty);
        refreshCart(res.data.cart);
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
        className="px-3 py-1.5 border-2 border-print-red text-print-red font-mono-display text-xs uppercase tracking-wider hover:bg-print-red hover:text-paper transition-colors flex items-center gap-1.5 disabled:opacity-50"
      >
        {pending ? (
          <div className="h-3.5 w-3.5 border-2 border-print-red/30 border-t-print-red rounded-full animate-spin" />
        ) : (
          <ShoppingCart className="h-3.5 w-3.5" />
        )}

        <span className="transition-opacity">{pending ? "Adding..." : "Add"}</span>
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
