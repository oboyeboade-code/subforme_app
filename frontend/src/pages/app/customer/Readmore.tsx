import { Link, useParams, useLocation } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import {
  ShoppingCart,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  CreditCard,
  AlertCircle,
  ArrowLeft,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import useSWR, { useSWRConfig } from "swr";
import {
  cartApi,
  serviceApi,
  wishlistApi,
  type Service,
  type ICartItem,
  type IWishlistItem,
} from "@/lib/api/";
import { CheckoutModal } from "@/components/app/CheckoutModal";

const KEYS = {
  PROFILE: "profile",
  SERVICES: "services",
  CART: "customer/cart",
  WISHLIST: "customer/wishlist",
  MINE: "subs/me",
} as const;

const SWR_OPTS = { revalidateOnFocus: false } as const;

const fetchers = {
  [KEYS.SERVICES]: () => serviceApi.listServices().then((res) => res.data.services),
  [KEYS.CART]: (): Promise<ICartItem[]> =>
    cartApi.getCart().then((res) => res.data.cart || []),
  [KEYS.WISHLIST]: (): Promise<IWishlistItem[]> =>
    wishlistApi.getWishlist().then((res) => res.data.wishlist || []),
};

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={cn("animate-pulse bg-ink/10", className)} />
);

const ReadmoreSkeleton = () => (
  <div className="max-w-4xl mx-auto px-6 py-10">
    <Skeleton className="h-4 w-48 mb-6" />
    <div className="grid lg:grid-cols-5 gap-8">
      <div className="lg:col-span-2">
        <Skeleton className="aspect-square border-2 border-ink/20" />
      </div>
      <div className="lg:col-span-3 space-y-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-14 w-full" />
        <div className="flex gap-3">
          <Skeleton className="h-11 w-36" />
          <Skeleton className="h-11 w-32" />
        </div>
      </div>
    </div>
  </div>
);

const Readmore = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const stateService = location.state?.service as Service | undefined;
  const { mutate: globalMutate } = useSWRConfig();

  const {
    data: services = [],
    error: servicesError,
    isLoading: servicesLoading,
  } = useSWR<Service[]>(KEYS.SERVICES, fetchers[KEYS.SERVICES], {
   ...SWR_OPTS,
    revalidateOnMount:!stateService,
    onError: (err) =>
      toast.error({ title: "Services error", description: err.message || "Try refreshing" }),
  });

  const { data: cart = [], mutate: mutateCart } = useSWR<ICartItem[]>(
    KEYS.CART,
    fetchers[KEYS.CART],
    {
     ...SWR_OPTS,
      onError: (err) =>
        toast.error({ title: "Cart error", description: err.message || "Try refreshing" }),
    }
  );

  const { data: wishlist = [], mutate: mutateWishlist } = useSWR<IWishlistItem[]>(
    KEYS.WISHLIST,
    fetchers[KEYS.WISHLIST],
    {
     ...SWR_OPTS,
      onError: (err) =>
        toast.error({ title: "Wishlist error", description: err.message || "Try refreshing" }),
    }
  );

  const service = useMemo(
    () => stateService || services.find((s) => s._id === id),
    [stateService, services, id]
  );

  const cartMap = useMemo(() => {
    return cart.reduce<Record<string, number>>((acc, item) => {
      acc[item.id] = item.qty;
      return acc;
    }, {});
  }, [cart]);

  const wishlistSet = useMemo(() => new Set(wishlist.map((w) => w.id)), [wishlist]);

  const currentQty = service? cartMap[service._id]?? 1 : 1;
  const isInCart = service? cartMap[service._id]!== undefined : false;
  const isInWishlist = service? wishlistSet.has(service._id) : false;

  const [qty, setQty] = useState(1);
  const [qtyInput, setQtyInput] = useState("1");
  const [payOpen, setPayOpen] = useState(false);

  useEffect(() => {
    if (service) {
      setQty(currentQty);
      setQtyInput(String(currentQty));
    }
  }, [service?._id, currentQty]);

  const handleWishlistToggle = async () => {
    if (!service) return;
    const prev = wishlist;
    const next = isInWishlist
     ? wishlist.filter((w) => w.id!== service._id)
      : [...wishlist, { id: service._id } as IWishlistItem];

    mutateWishlist(next, false); // optimistic
    try {
      if (isInWishlist) {
        await wishlistApi.removeFromWishlist(service._id);
        toast.success({ title: "Removed from wishlist" });
      } else {
        await wishlistApi.addToWishlist(service._id);
        toast.success({ title: "Added to wishlist" });
      }
      mutateWishlist();
    } catch (err: any) {
      mutateWishlist(prev, false);
      toast.error({ title: "Failed to update wishlist", description: err.message });
    }
  };

  const handleAddToCart = async () => {
    if (!service) return;
    const prev = cart;
    const existing = cart.find((c) => c.id === service._id);
    const next = existing
     ? cart.map((c) => (c.id === service._id? {...c, qty } : c))
      : [...cart, { id: service._id, qty } as ICartItem];

    mutateCart(next, false); // optimistic
    try {
      if (existing) {
        await cartApi.updateCartItem(service._id, qty);
      } else {
        await cartApi.addToCart(service._id, qty);
      }
      toast.success({ title: "Cart updated", description: `${qty} × ${service.name}` });
      mutateCart();
    } catch (err: any) {
      mutateCart(prev, false);
      toast.error({ title: "Failed to update cart", description: err.message });
    }
  };

  const handleQtyChange = (newQty: number) => {
    const clamped = Math.max(1, Math.min(99, newQty));
    setQty(clamped);
    setQtyInput(String(clamped));
    // no API call - only on button click
  };

  const handleQtyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "") {
      setQtyInput("");
      return;
    }
    if (!/^\d+$/.test(val)) return;
    setQtyInput(val);
  };

  const handleQtyInputBlur = () => {
    const num = parseInt(qtyInput) || 1;
    const clamped = Math.max(1, Math.min(99, num));
    setQty(clamped);
    setQtyInput(String(clamped));
  };

  const handleQtyInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  const handleCheckoutSuccess = async () => {
    await Promise.all([
      globalMutate(KEYS.CART),
      globalMutate(KEYS.PROFILE),
      globalMutate(KEYS.MINE),
    ]);
    setPayOpen(false);
  };

  if (!stateService && servicesLoading) return <ReadmoreSkeleton />;

  if (servicesError &&!service) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10">
        <EmptyState
          icon={AlertCircle}
          title="Could not load service"
          description="Something went wrong fetching this offer"
          ctaText="Back to Offers"
          ctaLink="/app/offers"
        />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10">
        <EmptyState
          icon={AlertCircle}
          title="Service not found"
          description="This offer may have been removed or is unavailable"
          ctaText="Browse Offers"
          ctaLink="/app/offers"
        />
      </div>
    );
  }

  const vendorName = service.vendorBusinessId?.businessName || "Unknown Vendor";
  const subtotal = service.priceNaira * qty;
  const hasQtyChanged = qty!== currentQty;

  const payNowItems = [
    {
     ...service,
      qty,
      _id: service._id,
      name: service.name,
      priceNaira: service.priceNaira,
      image: service.image,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <nav className="flex items-center gap-2 mb-6 font-mono-display text-xs uppercase tracking-wider text-ink/60">
        <Link to="/app" className="hover:text-ink transition-colors">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/app/offers" className="hover:text-ink transition-colors">
          Offers
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-ink font-medium">{service.category}</span>
      </nav>

      <div className="grid lg:grid-cols-5 gap-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="lg:col-span-2"
        >
          <div className="relative aspect-square border-2 border-ink overflow-hidden bg-ink/[0.02]">
            {service.image? (
              <img
                src={service.image}
                alt={service.name}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <div className="h-20 w-20 border-2 border-ink/20 flex items-center justify-center font-editorial italic text-2xl text-ink/40">
                  {service.name.slice(0, 2).toUpperCase()}
                </div>
              </div>
            )}

            <button
              onClick={handleWishlistToggle}
              aria-label={isInWishlist? "Remove from wishlist" : "Add to wishlist"}
              className={cn(
                "absolute top-3 right-3 h-11 w-11 border-2 border-ink flex items-center justify-center transition-colors",
                isInWishlist
                 ? "bg-print-red text-white hover:bg-print-red/90"
                  : "bg-paper text-ink hover:bg-ink hover:text-white"
              )}
            >
              <Heart className={cn("h-4 w-4", isInWishlist && "fill-current")} />
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-3"
        >
          <p className="font-mono-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
            {service.category}
          </p>
          <h1 className="font-editorial text-4xl text-ink">{service.name}</h1>
          <p className="mt-2 text-muted-foreground font-mono-display text-xs uppercase tracking-wider">
            by {vendorName}
          </p>

          <div className="mt-6 pb-6 border-b-2 border-ink">
            <p className="font-editorial italic text-2xl text-ink">
              ₦{service.priceNaira.toLocaleString()}
              <span className="font-mono-display text-xs uppercase tracking-wider text-muted-foreground ml-2">
                / unit
              </span>
            </p>
          </div>

          {service.description && (
            <p className="mt-6 text-sm text-ink/80 leading-relaxed">{service.description}</p>
          )}

          <div className="mt-8 border-2 border-ink p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono-display text-xs uppercase tracking-[0.2em]">
                Quantity
              </span>
              <div className="flex items-center border-2 border-ink">
                <button
                  onClick={() => handleQtyChange(qty - 1)}
                  disabled={qty <= 1}
                  className="px-3 py-2 hover:bg-ink hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <input
                  type="text"
                  inputMode="numeric"
                  value={qtyInput}
                  onChange={handleQtyInputChange}
                  onBlur={handleQtyInputBlur}
                  onKeyDown={handleQtyInputKeyDown}
                  className="w-12 text-center font-mono-display text-sm bg-transparent focus:outline-none focus:bg-ink/[0.04]"
                  aria-label="Quantity"
                />
                <button
                  onClick={() => handleQtyChange(qty + 1)}
                  disabled={qty >= 99}
                  className="px-3 py-2 hover:bg-ink hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>

            <div className="flex items-baseline justify-between pt-4 border-t border-ink/20">
              <span className="font-mono-display text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Subtotal
              </span>
              <span className="font-editorial italic text-xl text-ink">
                ₦{subtotal.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={isInCart &&!hasQtyChanged}
              className={cn(
                "flex-1 inline-flex items-center justify-center gap-2 border-2 border-ink px-4 py-3 font-mono-display text-[10px] uppercase tracking-[0.2em] transition-colors",
                isInCart
                 ? hasQtyChanged
                   ? "bg-print-orange text-white hover:bg-print-orange/90"
                    : "bg-ink/40 text-white cursor-default"
                  : "hover:bg-ink hover:text-white"
              )}
            >
              {isInCart? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
              {isInCart
               ? hasQtyChanged? `Update to ${qty}` : "In cart"
                : "Add to Cart"
              }
            </button>

            <button
              onClick={() => setPayOpen(true)}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-print-red text-white border-2 border-print-red px-4 py-3 font-mono-display text-[10px] uppercase tracking-[0.2em] hover:bg-print-red/90 transition-colors"
            >
              <CreditCard className="h-4 w-4" />
              Pay Now
            </button>
          </div>

          <Link
            to="/app/offers"
            className="mt-6 inline-flex items-center gap-2 font-mono-display text-[10px] uppercase tracking-[0.2em] text-ink hover:text-print-red transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to offers
          </Link>
        </motion.div>
      </div>

      <CheckoutModal
        open={payOpen}
        onOpenChange={setPayOpen}
        items={payNowItems}
        onSuccess={handleCheckoutSuccess}
        standalone
      />
    </div>
  );
};

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
}
const EmptyState = ({ icon: Icon, title, description, ctaText, ctaLink }: EmptyStateProps) => (
  <div className="w-full text-center py-12 border-2 border-dashed border-ink/20 bg-paper-deep/30">
    <Icon className="h-12 w-12 text-ink/30 mx-auto mb-4" />
    <h3 className="font-editorial text-lg text-ink mb-2">{title}</h3>
    <p className="text-ink/60 font-mono-display text-xs uppercase tracking-wider mb-6">
      {description}
    </p>
    <Link
      to={ctaLink}
      className="inline-flex items-center gap-2 bg-print-red text-white px-6 py-3 border-2 border-print-red font-mono-display text-xs uppercase tracking-wider hover:bg-print-red/90 transition-colors"
    >
      {ctaText}
      <ArrowLeft className="h-4 w-4" />
    </Link>
  </div>
);

export default Readmore;