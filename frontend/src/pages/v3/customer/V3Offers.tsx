import { useState, useMemo, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Link, useSearchParams } from "react-router-dom";
import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Heart, Search, X, Minus, Plus, AlertCircle, ShoppingCart, CreditCard } from "lucide-react";
import { V3Card, V3Pill, V3SectionHeader } from "@/components/v3/V3UI";
import { cn } from "@/lib/utils";
import { serviceApi, cartApi, wishlistApi, type Service, ICartItem, IWishlistItem } from "@/lib/api/";
import { V3CheckoutModal } from "@/components/v3/V3CheckoutModal";

const BATCH_SIZE = 4;

const KEYS = {
  SERVICES: "customer/services",
  CART: "customer/cart",
  WISHLIST: "customer/wishlist",
  PROFILE: "profile",
  MINE: "subs/me",
} as const;

const fetchers = {
  [KEYS.SERVICES]: () => serviceApi.listServices().then((res) => res.data.services),
  [KEYS.CART]: () => cartApi.getCart().then((res) => res.data.cart),
  [KEYS.WISHLIST]: () => wishlistApi.getWishlist().then((res) => res.data.wishlist),
};

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-ink/10 ${className}`} />
);

const V3OfferCardSkeleton = ({ count = 6 }: { count?: number }) => (
  <>
    {[...Array(count)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: i * 0.04 }}
      >
        <V3Card className="p-0 overflow-hidden h-full flex flex-col">
          <div className="relative aspect-[4/3] bg-ink/[0.04]">
            <Skeleton className="absolute inset-0" />
            <Skeleton className="absolute top-3 right-3 h-10 w-10 rounded-full" />
            <Skeleton className="absolute top-3 left-3 h-6 w-16 rounded-full" />
          </div>
          <div className="p-5 flex flex-col gap-3 flex-1">
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
            <div className="flex gap-2 mt-auto">
              <Skeleton className="flex-1 h-11 rounded-full" />
              <Skeleton className="h-11 w-24 rounded-full" />
              <Skeleton className="h-11 w-11 rounded-full" />
            </div>
          </div>
        </V3Card>
      </motion.div>
    ))}
  </>
);

const V3CategoryBarSkeleton = () => (
  <div className="flex items-center gap-2 pb-2 mb-10">
    {[...Array(5)].map((_, i) => (
      <Skeleton key={i} className="h-9 w-20 rounded-full shrink-0" />
    ))}
  </div>
);

const V3Offers = () => {
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get("category");

  const {
    data: OFFERS = [],
    error,
    isLoading,
  } = useSWR<Service[]>(KEYS.SERVICES, fetchers[KEYS.SERVICES], {
    onError: (err) =>
      toast({
        title: "Failed to load services",
        description: err.message || "Try refreshing",
        variant: "destructive",
      }),
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

  const wishlistSet = useMemo(() => new Set(wishlist.map((i) => i.id)), [wishlist]);

  const isInWishlist = (id: string) => wishlistSet.has(id);

  const [active, setActive] = useState(categoryFromUrl || "Food");
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "price-low" | "price-high">("newest");

  // Local qty per card - can be 0
  const [localQty, setLocalQty] = useState<Record<string, number>>({});
  const [payOpen, setPayOpen] = useState<string | null>(null);

  const ALL_CATS = useMemo(() => Array.from(new Set(OFFERS.map((s) => s.category))), [OFFERS]);

  useEffect(() => {
    if (categoryFromUrl && ALL_CATS.length > 0 && ALL_CATS.includes(categoryFromUrl)) {
      setActive(categoryFromUrl);
      const neededIndex = ALL_CATS.indexOf(categoryFromUrl) + 1;
      if (neededIndex > visibleCount) {
        setVisibleCount(neededIndex);
      }
    }
  }, [categoryFromUrl, ALL_CATS]);

  // Sync localQty with cart - if not in cart, default to 0
  useEffect(() => {
    const synced: Record<string, number> = {};
    OFFERS.forEach(o => {
      synced[o._id] = cartMap[o._id]?? localQty[o._id]?? 0;
    });
    setLocalQty(synced);
  }, [cartMap, OFFERS]);

  const visibleCats = ALL_CATS.slice(0, visibleCount);
  const hasMore = visibleCount < ALL_CATS.length;

  const visible = useMemo(() => {
    let result =
      active === "More"
     ? OFFERS.filter((o) => visibleCats.includes(o.category))
        : OFFERS.filter((o) => o.category === active);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.name.toLowerCase().includes(query) ||
          o.category.toLowerCase().includes(query) ||
          (o.vendorBusinessId as any)?.businessName?.toLowerCase?.().includes(query),
      );
    }

    if (sortBy === "price-low") {
      return [...result].sort((a, b) => a.priceNaira - b.priceNaira);
    } else if (sortBy === "price-high") {
      return [...result].sort((a, b) => b.priceNaira - a.priceNaira);
    }

    return result;
  }, [OFFERS, active, searchQuery, sortBy, visibleCats]);

  const handleCartUpdate = async (service: Service, newQty: number) => {
    const clamped = Math.max(0, Math.min(99, newQty));
    const prev = cart;
    const existing = cart.find((c) => c.id === service._id);

    // Optimistic update
    setLocalQty(p => ({...p, [service._id]: clamped }));

    let next: ICartItem[];
    if (clamped === 0) {
      // Remove from cart
      next = cart.filter(c => c.id!== service._id);
    } else if (existing) {
      // Update qty
      next = cart.map((c) => (c.id === service._id? {...c, qty: clamped } : c));
    } else {
      // Add new
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
      setCart(); // revalidate
    } catch (err: any) {
      setCart(prev, false);
      // revert local qty on error
      setLocalQty(p => ({...p, [service._id]: cartMap[service._id]?? 0 }));
      toast({
        title: "Failed to update cart",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleWishlistToggle = async (serviceId: string) => {
    const inWishlist = isInWishlist(serviceId);
    const prev = wishlist;
    const next = inWishlist
   ? wishlist.filter((w) => w.id!== serviceId)
      : [...wishlist, { id: serviceId } as IWishlistItem];

    refreshWishlist(next, false);
    try {
      const res = inWishlist
     ? await wishlistApi.removeFromWishlist(serviceId)
        : await wishlistApi.addToWishlist(serviceId);
      refreshWishlist(res.data.wishlist, false);
      toast({
        title: inWishlist? "Removed from wishlist" : "Added to wishlist",
      });
    } catch {
      refreshWishlist(prev, false);
      toast({
        title: "Failed to update wishlist",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const activeFilters = (searchQuery.trim()? 1 : 0) + (sortBy!== "newest"? 1 : 0);

  const currentPayService = payOpen? OFFERS.find(s => s._id === payOpen) : null;
  const payNowItems = currentPayService? [{
  ...currentPayService,
    qty: localQty[payOpen!]?? 1,
    _id: currentPayService._id,
    name: currentPayService.name,
    priceNaira: currentPayService.priceNaira,
    image: currentPayService.image,
  }] : [];

  if (error &&!isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-10 md:py-14">
        <V3EmptyState
          icon={AlertCircle}
          title="Could not load services"
          description="Something went wrong fetching your data"
          ctaText="Refresh Page"
          ctaLink=""
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-8 py-10 md:py-14">
      <V3SectionHeader
        title="Offers"
        meta={isLoading? "..." : `${visible.length} live`}
      />

      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-ink/40" />
          <input
            type="text"
            placeholder="Search offers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={isLoading}
            className="w-full pl-11 pr-10 py-2.5 rounded-xl border border-ink/12 bg-paper text-ink placeholder:text-ink/40 font-medium text-sm focus:outline-none focus:border-ink/30 transition-colors disabled:opacity-50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-3.5 text-ink/40 hover:text-ink transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            disabled={isLoading}
            className="px-3 py-2 rounded-lg border border-ink/12 bg-paper text-ink text-sm font-medium focus:outline-none focus:border-ink/30 transition-colors disabled:opacity-50"
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
              className="ml-auto px-3 py-2 rounded-lg border border-print-orange/50 text-print-orange text-sm font-medium hover:bg-print-orange/10 transition-colors"
            >
              Clear ({activeFilters})
            </button>
          )}
        </div>
      </div>

      {isLoading? (
        <V3CategoryBarSkeleton />
      ) : (
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 mb-10">
          {visibleCats.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all",
                active === c
               ? "bg-ink text-paper shadow-[0_8px_18px_-10px_hsl(var(--ink)/0.5)]"
                  : "bg-ink/[0.04] text-ink/70 hover:bg-ink/[0.08]",
              )}
            >
              {c}
            </button>
          ))}

          <button
            onClick={() => setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, ALL_CATS.length))}
            disabled={!hasMore}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all",
              hasMore
             ? "bg-print-orange text-paper hover:opacity-90"
                : "bg-ink/[0.06] text-ink/40 cursor-not-allowed",
            )}
          >
            {hasMore? "More" : "End"}
          </button>
        </div>
      )}

      {isLoading? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <V3OfferCardSkeleton count={6} />
        </div>
      ) : visible.length > 0? (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {visible.map((o, i) => {
              const qty = localQty[o._id]?? 0;

              return (
                <motion.div
                  key={o._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                >
                  <V3Card className="p-0 overflow-hidden h-full flex flex-col">
                    <div className="relative aspect-[4/3] overflow-hidden bg-ink/[0.04]">
                      <img
                        src={o.image}
                        alt={`${o.name} from ${(o.vendorBusinessId as any)?.businessName}`}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      <button
                        onClick={() => handleWishlistToggle(o._id)}
                        className={cn(
                          "absolute top-3 right-3 h-10 w-10 rounded-full backdrop-blur flex items-center justify-center transition-all",
                          isInWishlist(o._id)
                         ? "bg-red-500 text-white"
                            : "bg-paper/85 hover:bg-paper text-ink",
                        )}
                        aria-label={isInWishlist(o._id)? "Remove from wishlist" : "Add to wishlist"}
                      >
                        <Heart className={cn("h-4 w-4", isInWishlist(o._id) && "fill-current")} />
                      </button>
                      <div className="absolute top-3 left-3">
                        <V3Pill tone="ink">{o.category}</V3Pill>
                      </div>
                    </div>

                    <div className="p-5 flex flex-col gap-3 flex-1">
                      <h3 className="font-v3-display text-2xl leading-tight">
                        {o.name}
                        <span className="text-ink/50 font-sans text-base">
                          {" "}
                          - {(o.vendorBusinessId as any)?.businessName}
                        </span>
                      </h3>

                      <div className="text-sm text-ink/60 font-medium">
                        ₦ {o.priceNaira.toLocaleString()}
                        <span className="text-ink/40 text-xs ml-2">/ unit</span>
                      </div>

                      <div className="flex gap-2 mt-auto">
                        <Link
                          to={`/v3/app/readmore/${o._id}`}
                          state={{ service: o }}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-ink/[0.06] hover:bg-ink hover:text-paper py-2.5 text-sm font-medium transition-colors"
                        >
                          Read more <ArrowRight className="h-3.5 w-3.5" />
                        </Link>

                        {/* Stepper with cart icon at 0 */}
                        <div className="inline-flex items-center rounded-full border border-ink/15 bg-paper">
                          <button
                            onClick={() => handleCartUpdate(o, qty - 1)}
                            disabled={qty <= 0}
                            className="h-11 w-11 flex items-center justify-center rounded-l-full hover:bg-ink/[0.06] disabled:opacity-30 disabled:hover:bg-transparent"
                            aria-label="Decrease"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-10 text-center font-v3-display text-lg flex items-center justify-center">
                            {qty === 0? <ShoppingCart className="h-4 w-4 text-ink/50" /> : qty}
                          </span>
                          <button
                            onClick={() => handleCartUpdate(o, qty + 1)}
                            disabled={qty >= 99}
                            className="h-11 w-11 flex items-center justify-center rounded-r-full hover:bg-ink/[0.06] disabled:opacity-30 disabled:hover:bg-transparent"
                            aria-label="Increase"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Pay button - only show if qty > 0 */}
                        {qty > 0 && (
                          <button
                            onClick={() => setPayOpen(o._id)}
                            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-print-red text-paper hover:bg-print-red/90 h-11 w-11 transition-colors"
                            aria-label="Pay now"
                          >
                            <CreditCard className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </V3Card>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      ) : (
        <div className="text-center py-12 rounded-[18px] border border-ink/12 bg-ink/[0.02]">
          <p className="font-v3-display text-lg text-ink mb-2">No offers found</p>
          <p className="text-ink/55 text-sm mb-6">Try adjusting your filters or search query</p>
        </div>
      )}

      <V3CheckoutModal
        open={!!payOpen}
        onOpenChange={(v) =>!v && setPayOpen(null)}
        items={payNowItems}
        standalone
      />
    </div>
  );
};

interface V3EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
}

const V3EmptyState = ({
  icon: Icon,
  title,
  description,
  ctaText,
  ctaLink,
}: V3EmptyStateProps) => (
  <div className="w-full lg:col-span-full text-center py-12 2xl:py-8 rounded-[18px] border border-ink/12 bg-ink/[0.02]">
    <Icon className="h-12 w-12 text-ink/20 mx-auto mb-4" />
    <h3 className="font-v3-display text-lg text-ink mb-2">{title}</h3>
    <p className="text-ink/55 text-sm mb-6">{description}</p>
    <Link
      to={ctaLink}
      className="inline-flex items-center gap-2 bg-gradient-to-br from-print-red to-print-orange text-paper px-6 py-2.5 rounded-full font-medium text-sm hover:brightness-105 transition-all"
    >
      {ctaText}
      <ArrowRight className="h-4 w-4" />
    </Link>
  </div>
);

export default V3Offers;