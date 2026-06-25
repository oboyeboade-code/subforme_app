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
import { V3Card, V3Pill, V3Button } from "@/components/v3/V3UI";
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
import { V3CheckoutModal } from "@/components/v3/V3CheckoutModal";

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
  <div className={cn("animate-pulse bg-ink/10 rounded-2xl", className)} />
);

const V3ReadmoreSkeleton = () => (
  <div className="max-w-4xl mx-auto px-5 md:px-8 py-10 md:py-14">
    <Skeleton className="h-4 w-48 mb-6" />
    <V3Card className="p-0 overflow-hidden">
      <Skeleton className="aspect-[16/9] rounded-none" />
      <div className="p-6 md:p-8 space-y-4">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </V3Card>
  </div>
);

const V3Readmore = () => {
  const { mutate: globalMutate } = useSWRConfig();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const stateService = location.state?.service as Service | undefined;

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
    // no API call here - only on button click
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

  if (!stateService && servicesLoading) return <V3ReadmoreSkeleton />;

  if (servicesError &&!service) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-10">
        <div className="w-full text-center py-12 border-2 border-dashed border-ink/20 rounded-2xl">
          <AlertCircle className="h-12 w-12 text-ink/30 mx-auto mb-4" />
          <h3 className="font-v3-display text-lg text-ink mb-2">Could not load service</h3>
          <p className="text-ink/60 text-sm mb-6">Something went wrong fetching this offer</p>
          <Link to="/v3/app/offers">
            <V3Button>
              <ArrowLeft className="h-4 w-4" />
              Back to Offers
            </V3Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-10">
        <div className="w-full text-center py-12 border-2 border-dashed border-ink/20 rounded-2xl">
          <AlertCircle className="h-12 w-12 text-ink/30 mx-auto mb-4" />
          <h3 className="font-v3-display text-lg text-ink mb-2">Service not found</h3>
          <p className="text-ink/60 text-sm mb-6">
            This offer may have been removed or is unavailable
          </p>
          <Link to="/v3/app/offers">
            <V3Button>
              <ArrowLeft className="h-4 w-4" />
              Browse Offers
            </V3Button>
          </Link>
        </div>
      </div>
    );
  }

  const vendorName = service.vendorBusinessId?.businessName || "Unknown Vendor";
  const subtotal = service.priceNaira * qty;
  const payNowItems = [{...service, qty }];
  const hasQtyChanged = qty!== currentQty;

  return (
    <div className="max-w-4xl mx-auto px-5 md:px-8 py-10 md:py-14">
      <motion.nav
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-2 mb-6 text-sm text-ink/60"
      >
        <Link to="/v3/app" className="hover:text-ink transition-colors">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to="/v3/app/offers" className="hover:text-ink transition-colors">
          Offers
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-ink font-medium">{service.category}</span>
      </motion.nav>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <V3Card className="p-0 overflow-hidden">
          <div className="relative aspect-[16/9] bg-ink/[0.04] overflow-hidden">
            {service.image? (
              <img
                src={service.image}
                alt={`${service.name} from ${vendorName}`}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <div className="h-20 w-20 border-2 border-ink/20 rounded-2xl flex items-center justify-center font-v3-display text-2xl text-ink/40">
                  {service.name.slice(0, 2).toUpperCase()}
                </div>
              </div>
            )}
            <button
              onClick={handleWishlistToggle}
              className={cn(
                "absolute top-4 right-4 h-11 w-11 rounded-full backdrop-blur flex items-center justify-center transition-all",
                isInWishlist
               ? "bg-red-500 text-white"
                  : "bg-paper/85 hover:bg-paper text-ink"
              )}
              aria-label={isInWishlist? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart className={cn("h-4 w-4", isInWishlist && "fill-current")} />
            </button>
            <div className="absolute top-4 left-4">
              <V3Pill tone="red">{service.category}</V3Pill>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <h1 className="font-v3-display text-4xl md:text-5xl">{service.name}</h1>
            <p className="mt-3 text-lg text-ink/60">by {vendorName}</p>

            <div className="mt-4 flex items-center gap-3 flex-wrap">
              <span className="inline-block px-3 py-1 rounded-full bg-ink/[0.06] text-sm font-medium">
                ₦ {service.priceNaira.toLocaleString()} / unit
              </span>
              <V3Pill tone="ink">{service.category}</V3Pill>
            </div>

            <div className="mt-6 rounded-2xl border border-ink/12 bg-ink/[0.02] p-4 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-medium text-ink/55">
                  Quantity
                </p>
                <div className="mt-2 inline-flex items-center rounded-full border border-ink/15 bg-paper">
                  <button
                    onClick={() => handleQtyChange(qty - 1)}
                    disabled={qty <= 1}
                    className="h-10 w-10 flex items-center justify-center rounded-l-full hover:bg-ink/[0.06] disabled:opacity-30 disabled:hover:bg-transparent"
                    aria-label="Decrease"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={qtyInput}
                    onChange={handleQtyInputChange}
                    onBlur={handleQtyInputBlur}
                    onKeyDown={handleQtyInputKeyDown}
                    className="w-12 text-center font-v3-display text-xl bg-transparent focus:outline-none focus:bg-ink/[0.04] rounded"
                    aria-label="Quantity"
                  />
                  <button
                    onClick={() => handleQtyChange(qty + 1)}
                    disabled={qty >= 99}
                    className="h-10 w-10 flex items-center justify-center rounded-r-full hover:bg-ink/[0.06] disabled:opacity-30 disabled:hover:bg-transparent"
                    aria-label="Increase"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider font-medium text-ink/55">
                  Subtotal
                </p>
                <p className="font-v3-display text-3xl text-ink">
                  ₦ {subtotal.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => handleAddToCart()}
                className={cn(
                  "rounded-full py-3 text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors",
                  isInCart
                 ? hasQtyChanged
                   ? "bg-print-orange text-paper"
                    : "bg-ink/40 text-paper cursor-default"
                  : "bg-ink/[0.06] hover:bg-ink hover:text-paper"
                )}
                disabled={isInCart &&!hasQtyChanged}
              >
                {isInCart? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                {isInCart
                 ? hasQtyChanged? `Update to ${qty}` : "In cart"
                  : "Add to cart"
                }
              </button>
              <V3Button onClick={() => setPayOpen(true)} size="lg">
                <CreditCard className="h-4 w-4" />
                Pay now
              </V3Button>
            </div>

            <section className="mt-10">
              <h2 className="font-v3-display text-2xl mb-4">About this offer</h2>
              <p className="text-ink/70 leading-relaxed">
                {service.description ||
                  `Enjoy exclusive access to the ${service.name} package from ${vendorName}.`}
              </p>
            </section>
          </div>
        </V3Card>
      </motion.div>

      <V3CheckoutModal open={payOpen} onOpenChange={setPayOpen} onSuccess={handleCheckoutSuccess} items={payNowItems} standalone />
    </div>
  );
};

export default V3Readmore;