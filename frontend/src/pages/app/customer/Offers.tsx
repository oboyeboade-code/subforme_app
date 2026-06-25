import { useState, useMemo, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Link, useSearchParams } from "react-router-dom";
import useSWR, { useSWRConfig } from "swr";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Heart,
  Search,
  X,
  Minus,
  Plus,
  AlertCircle,
  CreditCard,
  ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { serviceApi, cartApi, wishlistApi, type Service, ICartItem, IWishlistItem } from "@/lib/api/";
import { CheckoutModal } from "@/components/app/CheckoutModal";

const BATCH_SIZE = 3;

const KEYS = {
  SERVICES: "customer/services",
  CART: "customer/cart",
  WISHLIST: "customer/wishlist",
  PROFILE: "profile",
  MINE: "subs/me",
} as const;

const fetchers = {
  [KEYS.SERVICES]: () => serviceApi.listServices().then((res) => res.data.services),
  [KEYS.CART]: () => cartApi.getCart().then((res) => res.data.cart || []),
  [KEYS.WISHLIST]: () => wishlistApi.getWishlist().then((res) => res.data.wishlist || []),
};

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-ink/10 ${className}`} />
);

const OfferCardSkeleton = ({ count = 6 }: { count?: number }) => (
  <>
    {[...Array(count)].map((_, i) => (
      <article key={i} className="border-2 border-ink/20 bg-card flex flex-col">
        <div className="relative aspect-[4/3] border-b-2 border-ink/20 bg-paper-deep">
          <Skeleton className="absolute inset-0" />
          <Skeleton className="absolute top-3 right-3 h-10 w-10" />
          <Skeleton className="absolute top-3 left-3 h-6 w-16" />
        </div>

        <div className="px-4 py-3 border-b-2 border-ink/20 space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>

        <div className="px-4 py-3 flex items-center justify-between gap-3 mt-auto border-b-2 border-ink/20">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-9 w-16" />
        </div>

        <Skeleton className="h-10" />
      </article>
    ))}
  </>
);

const CategoryBarSkeleton = () => (
  <div className="flex items-center gap-3 pb-2 mb-8">
    <Skeleton className="h-4 w-16 shrink-0" />
    {[...Array(4)].map((_, i) => (
      <Skeleton key={i} className="h-9 w-20 shrink-0" />
    ))}
  </div>
);

const Offers = () => {
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get("category");
  const { mutate: globalMutate } = useSWRConfig();

  const {
    data: OFFERS = [],
    error,
    isLoading,
  } = useSWR<Service[]>(KEYS.SERVICES, fetchers[KEYS.SERVICES], {
    onError: (err) => toast.error(err.message || "Failed to load services"),
    revalidateOnFocus: false,
  });

  const { data: cart = [], mutate: setCart } = useSWR<ICartItem[]>(
    KEYS.CART,
    fetchers[KEYS.CART],
    { revalidateOnFocus: false }
  );

  const { data: wishlist = [], mutate: refreshWishlist } = useSWR<IWishlistItem[]>(
    KEYS.WISHLIST,
    fetchers[KEYS.WISHLIST],
    { revalidateOnFocus: false }
  );

  const cartMap = useMemo(() => {
    return cart.reduce((acc, item) => {
      acc[item.id] = item.qty;
      return acc;
    }, {} as Record<string, number>);
  }, [cart]);

  const wishlistSet = useMemo(() => new Set(wishlist.map(i => i.id)), [wishlist]);

  const cartQty = (id: string) => cartMap[id]?? 0;
  const isInCart = (id: string) =>!!cartMap[id];
  const isInWishlist = (id: string) => wishlistSet.has(id);

  const [active, setActive] = useState(categoryFromUrl || "Food");
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "price-low" | "price-high">("newest");
  const [localQty, setLocalQty] = useState<Record<string, number>>({});
  const [qtyInput, setQtyInput] = useState<Record<string, string>>({});
  const [payOpen, setPayOpen] = useState<string | null>(null);

  const ALL_CATS = useMemo(() => Array.from(new Set(OFFERS.map((s) => s.category))), [OFFERS]);

  useEffect(() => {
    if (categoryFromUrl && ALL_CATS.length > 0 && ALL_CATS.includes(categoryFromUrl)) {
      setActive(categoryFromUrl);
      const neededIndex = ALL_CATS.indexOf(categoryFromUrl) + 1;
      if (neededIndex > visibleCount) setVisibleCount(neededIndex);
    }
  }, [categoryFromUrl, ALL_CATS]);

  // NEW: Sync localQty with cart - default to 0
  useEffect(() => {
    const synced: Record<string, number> = {};
    const syncedInput: Record<string, string> = {};
    OFFERS.forEach(o => {
      const q = cartMap[o._id]?? localQty[o._id]?? 0;
      synced[o._id] = q;
      syncedInput[o._id] = String(q);
    });
    setLocalQty(synced);
    setQtyInput(syncedInput);
  }, [cartMap, OFFERS]);

  const visibleCats = ALL_CATS.slice(0, visibleCount);
  const hasMore = visibleCount < ALL_CATS.length;

  const visible = useMemo(() => {
    let result = OFFERS.filter((o) =>
      active === "More"? visibleCats.includes(o.category) : o.category === active,
    );

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.name.toLowerCase().includes(q) ||
          o.category.toLowerCase().includes(q) ||
          (o.vendorBusinessId as any)?.businessName?.toLowerCase?.().includes(q),
      );
    }

    if (sortBy === "price-low") {
      return [...result].sort((a, b) => a.priceNaira - b.priceNaira);
    } else if (sortBy === "price-high") {
      return [...result].sort((a, b) => b.priceNaira - a.priceNaira);
    }

    return result;
  }, [OFFERS, active, searchQuery, sortBy, visibleCats]);

  // NEW: Unified cart update with optimistic updates
  const handleCartUpdate = async (service: Service, newQty: number) => {
    const clamped = Math.max(0, Math.min(99, newQty));
    const prev = cart;
    const existing = cart.find((c) => c.id === service._id);

    setLocalQty(p => ({...p, [service._id]: clamped }));
    setQtyInput(p => ({...p, [service._id]: String(clamped) }));

    let next: ICartItem[];
    if (clamped === 0) {
      next = cart.filter(c => c.id!== service._id);
    } else if (existing) {
      next = cart.map((c) => (c.id === service._id? {...c, qty: clamped } : c));
    } else {
      next = [...cart, { id: service._id, qty: clamped } as ICartItem];
    }

    setCart(next, false);
    try {
      if (clamped === 0) {
        await cartApi.removeFromCart(service._id);
        toast({ title: "Removed from cart", description: service.name });
      } else if (existing) {
        await cartApi.updateCartItem(service._id, clamped);
        toast({ title: "Cart updated", description: `${clamped} × ${service.name}` });
      } else {
        await cartApi.addToCart(service._id, clamped);
        toast({ title: "Added to cart", description: `${clamped} × ${service.name}` });
      }
      setCart();
    } catch (err: any) {
      setCart(prev, false);
      setLocalQty(p => ({...p, [service._id]: cartMap[service._id]?? 0 }));
      setQtyInput(p => ({...p, [service._id]: String(cartMap[service._id]?? 0) }));
      toast({
        title: "Failed to update cart",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleQtyInputChange = (serviceId: string, val: string) => {
    if (val === "") {
      setQtyInput(prev => ({...prev, [serviceId]: "" }));
      return;
    }
    if (!/^\d+$/.test(val)) return;
    setQtyInput(prev => ({...prev, [serviceId]: val }));
  };

  const handleQtyInputBlur = (service: Service) => {
    const num = parseInt(qtyInput[service._id]) || 0;
    const clamped = Math.max(0, Math.min(99, num));
    handleCartUpdate(service, clamped);
  };

  const handleQtyInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, service: Service) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  const handleWishlistToggle = async (serviceId: string) => {
    const inWishlist = isInWishlist(serviceId);
    try {
      const res = inWishlist
       ? await wishlistApi.removeFromWishlist(serviceId)
        : await wishlistApi.addToWishlist(serviceId);
      refreshWishlist(res.data.wishlist, false);
    } catch {
      toast({
        title: "Failed",
        description: "Failed to update wishlist",
        variant: "destructive",
      });
    }
  };

  const handleCheckoutSuccess = async () => {
    await Promise.all([
      globalMutate(KEYS.CART),
      globalMutate(KEYS.PROFILE),
      globalMutate(KEYS.MINE),
    ]);
    setPayOpen(null);
  };

  const activeFilters = (searchQuery.trim()? 1 : 0) + (sortBy!== "newest"? 1 : 0);

  if (error &&!isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10">
        <EmptyState
          icon={AlertCircle}
          title="Could not load services"
          description="Something went wrong fetching your data"
          ctaText="Refresh Page"
          ctaLink=""
        />
      </div>
    );
  }

  const currentPayService = payOpen? OFFERS.find(s => s._id === payOpen) : null;
  const payNowItems = currentPayService? [{
...currentPayService,
    qty: localQty[payOpen!]?? 1,
    _id: currentPayService._id,
    name: currentPayService.name,
    priceNaira: currentPayService.priceNaira,
    image: currentPayService.image,
  }] : [];

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <header className="mb-8 pb-3 border-b-2 border-ink flex items-baseline justify-between">
        <h1 className="font-editorial text-3xl text-ink">Offers</h1>
        <span className="font-mono-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Section · B
        </span>
      </header>

      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-ink/40" />
          <input
            type="text"
            placeholder="Search services, categories, vendors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={isLoading}
            className="w-full pl-10 pr-10 py-2.5 border-2 border-ink bg-paper text-ink placeholder:text-ink/40 font-mono-display text-xs uppercase tracking-wider focus:outline-none focus:bg-paper-deep transition-colors disabled:opacity-50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-3 text-ink/40 hover:text-ink transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-mono-display text-xs uppercase tracking-wider text-ink/60">
            Sort by:
          </span>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            disabled={isLoading}
            className="px-3 py-1.5 border-2 border-ink bg-paper text-ink font-mono-display text-xs uppercase tracking-wider focus:outline-none focus:bg-paper-deep transition-colors disabled:opacity-50"
          >
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>

          {activeFilters > 0 && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSortBy("newest");
              }}
              className="ml-auto px-3 py-1.5 border-2 border-print-orange text-print-orange font-mono-display text-xs uppercase tracking-wider hover:bg-print-orange hover:text-paper transition-colors"
            >
              Clear filters ({activeFilters})
            </button>
          )}
        </div>
      </div>

      {isLoading? (
        <CategoryBarSkeleton />
      ) : (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 mb-8 font-mono-display text-xs uppercase tracking-wider">
          <span className="text-muted-foreground shrink-0">Category:</span>

          {visibleCats.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={cn(
                "shrink-0 px-3 py-1.5 border-2 border-ink transition-colors",
                active === c? "bg-ink text-paper" : "bg-transparent text-ink",
              )}
            >
              {c}
            </button>
          ))}

          <button
            onClick={() => setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, ALL_CATS.length))}
            disabled={!hasMore}
            className={cn(
              "shrink-0 px-3 py-1.5 border-2 border-ink transition-colors",
              hasMore
               ? "bg-print-orange text-paper hover:opacity-90"
                : "bg-ink/10 text-ink/40 cursor-not-allowed",
            )}
          >
            {hasMore? "More" : "End"}
          </button>
        </div>
      )}

      {searchQuery &&!isLoading && (
        <p className="font-mono-display text-xs uppercase tracking-wider text-ink/60 mb-4">
          Found {visible.length} result{visible.length!== 1? "s" : ""}
        </p>
      )}

      {isLoading? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <OfferCardSkeleton count={6} />
        </div>
      ) : visible.length > 0? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visible.map((o) => {
            const qty = localQty[o._id]?? 0;
            const subtotal = o.priceNaira * qty;
            const vendorName = (o as any)?.vendorBusinessId?.businessName || "Unknown Vendor";

            return (
              <article
                key={o._id}
                className="border-2 border-ink bg-card flex flex-col hover:shadow-lg transition-shadow"
              >
                <div className="relative aspect-[4/3] overflow-hidden border-b-2 border-ink bg-paper-deep">
                  <img
                    src={o.image}
                    alt={o.name}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent" />
                  <button
                    onClick={() => handleWishlistToggle(o._id)}
                    className={cn(
                      "absolute top-3 right-3 h-10 w-10 flex items-center justify-center border-2 border-ink transition-colors",
                      isInWishlist(o._id)
                       ? "bg-print-red text-paper"
                        : "bg-paper/90 backdrop-blur text-ink hover:bg-paper",
                    )}
                  >
                    <Heart className={cn("h-4 w-4", isInWishlist(o._id) && "fill-current")} />
                  </button>
                  <span className="absolute top-3 left-3 font-mono-display text-[10px] uppercase tracking-[0.15em] bg-paper/90 backdrop-blur px-2 py-1 border-2 border-ink text-ink">
                    {o.category}
                  </span>
                </div>

                <div className="px-4 py-3 border-b-2 border-ink">
                  <h3 className="font-editorial text-xl text-ink leading-tight">{o.name}</h3>
                  <p className="font-mono-display text-[10px] uppercase tracking-[0.15em] text-ink/60 mt-1">
                    {vendorName} · {o.category}
                  </p>
                </div>

                <div className="px-4 py-3 flex items-center justify-between gap-3 mt-auto border-b-2 border-ink">
                  <span className="font-mono-display text-xs uppercase tracking-wider text-ink/70">
                    ₦ {o.priceNaira.toLocaleString()}
                  </span>

                  {/* NEW: Full stepper with input */}
                  <div className="flex items-center border-2 border-ink">
                    <button
                      onClick={() => handleCartUpdate(o, qty - 1)}
                      disabled={qty <= 0}
                      className="h-9 w-9 flex items-center justify-center text-ink hover:bg-ink hover:text-paper transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={qtyInput[o._id]?? "0"}
                      onChange={(e) => handleQtyInputChange(o._id, e.target.value)}
                      onBlur={() => handleQtyInputBlur(o)}
                      onKeyDown={(e) => handleQtyInputKeyDown(e, o)}
                      className="w-8 text-center font-mono-display text-xs bg-transparent text-ink focus:outline-none focus:bg-ink/[0.04]"
                    />
                    <button
                      onClick={() => handleCartUpdate(o, qty + 1)}
                      disabled={qty >= 99}
                      className="h-9 w-9 flex items-center justify-center text-ink hover:bg-ink hover:text-paper transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* NEW: Subtotal + Pay button row */}
                <div className="flex gap-0">
                  <Link
                    to={`/app/readmore/${o._id}`}
                    state={{ service: o }}
                    className="flex-1 text-center font-mono-display text-xs uppercase tracking-wider text-ink py-3 hover:bg-ink hover:text-paper transition-colors border-r-2 border-ink"
                  >
                    Read more →
                  </Link>
                  <button
                    onClick={() => setPayOpen(o._id)}
                    disabled={qty === 0}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 bg-print-red text-white py-3 font-mono-display text-xs uppercase tracking-wider hover:bg-print-red/90 transition-colors disabled:opacity-30 disabled:hover:bg-print-red"
                  >
                    <CreditCard className="h-3 w-3" />
                    Pay {qty > 0 && `₦${subtotal.toLocaleString()}`}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-ink/20 bg-paper-deep/30">
          <p className="font-editorial text-lg text-ink mb-2">No offers found</p>
          <p className="text-ink/60 font-mono-display text-xs uppercase tracking-wider">
            Try adjusting your search or filters
          </p>
        </div>
      )}

      <CheckoutModal
        open={!!payOpen}
        onOpenChange={(v) =>!v && setPayOpen(null)}
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
const EmptyState = ({
  icon: Icon,
  title,
  description,
  ctaText,
  ctaLink,
}: EmptyStateProps) => (
  <div className="w-full text-center py-12 border-2 border-dashed border-ink/20 bg-paper-deep/30">
    <Icon className="h-12 w-12 text-ink/30 mx-auto mb-4" />
    <h3 className="font-editorial text-lg text-ink mb-2">{title}</h3>
    <p className="text-ink/60 font-mono-display text-xs uppercase tracking-wider mb-6">{description}</p>
    <Link
      to={ctaLink}
      className="inline-flex items-center gap-2 bg-print-red text-white px-6 py-3 border-2 border-print-red font-mono-display text-xs uppercase tracking-wider hover:bg-print-red/90 transition-colors"
    >
      {ctaText}
      <ArrowLeft className="h-4 w-4" />
    </Link>
  </div>
);

export default Offers;