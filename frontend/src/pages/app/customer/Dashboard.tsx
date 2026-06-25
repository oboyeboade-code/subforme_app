import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import useSWR, { useSWRConfig } from "swr";
import {
  Settings,
  Pencil,
  ShoppingCart,
  Heart,
  ArrowRight,
  CreditCard,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { SettingsModal } from "@/components/app/SettingsModal";
import { ProfileModal } from "@/components/app/ProfileModal";
import { CheckoutModal } from "@/components/app/CheckoutModal";
import {
  cartApi,
  wishlistApi,
  userApi,
  serviceApi,
  type IWishlistItem,
  type ICartItem,
  type Service,
  type Profile,
  type ServiceCode,
} from "@/lib/api/";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const KEYS = {
  PROFILE: "profile",
  SERVICES: "services",
  CART: "customer/cart",
  WISHLIST: "customer/wishlist",
  MINE: "subs/me",
} as const;

const fetchers = {
  [KEYS.PROFILE]: () => userApi.getProfile().then((res) => res.data),
  [KEYS.SERVICES]: () => serviceApi.listServices().then((res) => res.data.services),
  [KEYS.CART]: (): Promise<ICartItem[]> =>
    cartApi.getCart().then((res) => res.data.cart || []),
  [KEYS.WISHLIST]: (): Promise<IWishlistItem[]> =>
    wishlistApi.getWishlist().then((res) => res.data.wishlist || []),
  [KEYS.MINE]: () =>
    serviceApi.getSubscriptions().then((res) => res.data.subscriptions || []),
};

const SWR_OPTS = { revalidateOnFocus: false } as const;

const initialsOf = (name?: string) => {
  if (!name) return "??";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const Dashboard = () => {
  const { mutate: globalMutate } = useSWRConfig();

  const {
    data: profileData,
    error: profileError,
    isLoading: profileLoading,
  } = useSWR<Profile>(KEYS.PROFILE, fetchers[KEYS.PROFILE], {
    ...SWR_OPTS,
    onError: (err) =>
      toast.error({ title: "Profile error", description: err.message || "Try refreshing" }),
  });

  const {
    data: offers = [],
    error: offersError,
    isLoading: offersLoading,
  } = useSWR<Service[]>(KEYS.SERVICES, fetchers[KEYS.SERVICES], {
    ...SWR_OPTS,
    onError: (err) =>
      toast.error({ title: "Services error", description: err.message || "Try refreshing" }),
  });

  const {
    data: cart = [],
    error: cartError,
    isLoading: cartLoading,
    mutate: mutateCart,
  } = useSWR<ICartItem[]>(KEYS.CART, fetchers[KEYS.CART], {
    ...SWR_OPTS,
    onError: (err) =>
      toast.error({ title: "Cart error", description: err.message || "Try refreshing" }),
  });

  const {
    data: wishlist = [],
    error: wishlistError,
    isLoading: wishlistLoading,
    mutate: mutateWishlist,
  } = useSWR<IWishlistItem[]>(KEYS.WISHLIST, fetchers[KEYS.WISHLIST], {
    ...SWR_OPTS,
    onError: (err) =>
      toast.error({ title: "Wishlist error", description: err.message || "Try refreshing" }),
  });

  const { data: subscriptionsData, isLoading: subsLoading } = useSWR<ServiceCode[]>(
    KEYS.MINE,
    fetchers[KEYS.MINE],
    {
      ...SWR_OPTS,
      onError: (err) =>
        toast.error({ title: "Subscription error", description: err.message || "Try refreshing" }),
    },
  );

  const hasError = profileError || offersError || cartError || wishlistError;

  const cartMap = useMemo(
    () =>
      cart.reduce<Record<string, number>>((acc, item) => {
        acc[item.id] = item.qty;
        return acc;
      }, {}),
    [cart],
  );
  const wishlistSet = useMemo(() => new Set(wishlist.map((w) => w.id)), [wishlist]);

  const profile = useMemo(
    () => ({
      name: profileData?.name,
      email: profileData?.email,
      joined: profileData?.createdAt
        ? new Date(profileData.createdAt).toLocaleDateString()
        : "",
    }),
    [profileData],
  );

  const type = profileData?.subscriptionPlan;
  const subs = subscriptionsData || [];
  const activeSubsCount = subs.filter((s: any) => s?.status === "active").length;

  const cartItems = useMemo(
    () =>
      offers
        .filter((o) => cartMap[o._id] !== undefined)
        .map((o) => ({ ...o, qty: cartMap[o._id] })),
    [offers, cartMap],
  );
  const wishlistItems = useMemo(
    () => offers.filter((o) => wishlistSet.has(o._id)),
    [offers, wishlistSet],
  );

  const cartTotal = useMemo(
    () => cartItems.reduce((sum, i) => sum + i.priceNaira * i.qty, 0),
    [cartItems],
  );

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const handleClearCart = async () => {
    const prev = cart;
    mutateCart([], false);
    try {
      await cartApi.clearCart();
      toast.success({ title: "Cart cleared" });
      mutateCart();
    } catch (err: any) {
      mutateCart(prev, false);
      toast.error({ title: "Failed to clear cart", description: err.message });
    }
  };

  const handleClearWishlist = async () => {
    const prev = wishlist;
    mutateWishlist([], false);
    try {
      await wishlistApi.clearWishlist();
      toast.success({ title: "Wishlist cleared" });
      mutateWishlist();
    } catch (err: any) {
      mutateWishlist(prev, false);
      toast.error({ title: "Failed to clear wishlist", description: err.message });
    }
  };

  const handleCheckoutSuccess = async () => {
    await Promise.all([
      globalMutate(KEYS.CART),
      globalMutate(KEYS.PROFILE),
      globalMutate(KEYS.MINE),
    ]);
    setCheckoutOpen(false);
  };

  if (hasError) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10">
        <EmptyState
          icon={AlertCircle}
          title="Could not load dashboard"
          description="Something went wrong fetching your data"
          ctaText="Refresh Page"
          ctaLink=""
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* HERO — matches AppHome welcome banner */}
      {profileLoading ? (
        <HeroSkeleton />
      ) : (
        <div className="relative border-2 border-ink p-8 md:p-10 mb-12 bg-card overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <button onClick={() => setProfileOpen(true)} className="flex items-center gap-5 text-left group min-w-0">
              <div className="h-16 w-16 border-2 border-ink bg-print-orange flex items-center justify-center font-editorial italic text-2xl text-ink group-hover:bg-print-red group-hover:text-white transition-colors shrink-0">
                {initialsOf(profile.name)}
              </div>
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1.5 border border-ink/20 bg-ink/5 px-3 py-1 font-mono-display text-[10px] uppercase tracking-wider text-ink/70">
                  <Zap className="h-3 w-3" />
                  Your dashboard
                </span>
                <h1 className="font-editorial mt-3 text-3xl md:text-4xl text-ink leading-[1.1] flex items-center gap-2 truncate">
                  {profile.name}
                  <Pencil className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </h1>
                <p className="mt-2 text-ink/60 font-mono-display text-[10px] uppercase tracking-wider truncate">
                  Joined {profile.joined} · {profile.email}
                </p>
              </div>
            </button>

            <button
              onClick={() => setSettingsOpen(true)}
              className="inline-flex items-center gap-2 border-2 border-ink bg-paper px-4 py-3 font-mono-display text-[10px] uppercase tracking-wider text-ink hover:bg-ink hover:text-paper transition-colors shrink-0"
            >
              <Settings className="h-4 w-4" />
              Settings
            </button>
          </div>

          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle at 2px 2px, black 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />
        </div>
      )}

      {/* PLAN STRIP */}
      {!profileLoading && type && (
        <div
          className={cn(
            "border-2 border-ink text-white px-4 py-3 mb-12 flex items-center justify-between flex-wrap gap-3",
            type === "basic" && "bg-zinc-700",
            type === "premium" && "bg-print-orange",
          )}
        >
          <div className="flex items-center gap-3">
            <span className="font-mono-display text-xs uppercase tracking-[0.2em]">Plan</span>
            <span className="font-editorial italic text-2xl capitalize">{type}</span>
            <span className="font-mono-display text-[10px] uppercase tracking-wider opacity-80">
              {activeSubsCount} active sub{activeSubsCount === 1 ? "" : "s"}
            </span>
          </div>
          {type !== "premium" && (
            <Link
              to="/app/plans"
              className="inline-flex items-center gap-2 bg-white text-ink border-2 border-white px-3 py-1.5 font-mono-display text-[10px] uppercase tracking-[0.2em] hover:bg-paper transition-colors"
            >
              Upgrade <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      )}

      {/* STAT STRIP */}
      <section className="mb-12 pb-8 border-b-2 border-ink">
        <header className="mb-6 pb-3 border-b-2 border-ink flex items-baseline justify-between">
          <h2 className="font-editorial text-2xl text-ink">At a Glance</h2>
          <span className="font-mono-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Pg. 01
          </span>
        </header>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <EdStat label="Cart Total" value={`₦${cartTotal.toLocaleString()}`} icon={CreditCard} />
          <EdStat label="Wishlist" value={wishlistItems.length} icon={Heart} />
          <EdStat label="Active Subs" value={activeSubsCount} icon={Sparkles} />
          <EdStat label="Items in Cart" value={cartItems.length} icon={TrendingUp} />
        </div>
      </section>

      {/* CART */}
      <section className="mb-12">
        <header className="flex items-baseline justify-between mb-6 pb-3 border-b-2 border-ink gap-3 flex-wrap">
          <h2 className="font-editorial text-3xl text-ink">Cart</h2>
          <div className="flex items-center gap-3">
            {!offersLoading && cartItems.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleClearCart}
                  className="inline-flex items-center border-2 border-ink px-3 py-2 font-mono-display text-[10px] uppercase tracking-[0.2em] hover:bg-ink hover:text-white transition-colors"
                >
                  Clear Cart
                </button>
                <button
                  type="button"
                  onClick={() => setCheckoutOpen(true)}
                  className="inline-flex items-center gap-2 bg-print-red text-primary-foreground border-2 border-ink px-4 py-2 font-mono-display text-[10px] uppercase tracking-[0.2em] hover:bg-print-red/90 transition-colors"
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  Checkout
                </button>
              </>
            )}
            <span className="font-mono-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Pg. 02
            </span>
          </div>
        </header>
        <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
          {cartLoading || offersLoading ? (
            <PreviewCardSkeleton count={3} />
          ) : cartItems.length > 0 ? (
            cartItems.map((item) => (
              <PreviewCard
                key={item._id}
                title={`${item.name} x ${item.qty}`}
                provider={(item as any)?.vendorBusinessId?.businessName}
                image={item.image}
                initials={item.name.slice(0, 2).toUpperCase()}
                meta={`₦${(item.priceNaira * item.qty).toLocaleString("en-NG")}`}
                accent="cart"
                to={`/app/readmore/${item._id}`}
              />
            ))
          ) : (
            <EmptyState
              icon={ShoppingCart}
              title="Your cart is empty"
              description="Add items from Offers to see them here"
              ctaText="Browse Offers"
              ctaLink="/app/offers"
            />
          )}
        </div>
      </section>

      {/* WISHLIST */}
      <section className="mb-12">
        <header className="flex items-baseline justify-between mb-6 pb-3 border-b-2 border-ink gap-3 flex-wrap">
          <h2 className="font-editorial text-3xl text-ink">Wishlist</h2>
          <div className="flex items-center gap-3">
            {!wishlistLoading && wishlistItems.length > 0 && (
              <button
                type="button"
                onClick={handleClearWishlist}
                className="inline-flex items-center border-2 border-ink px-3 py-2 font-mono-display text-[10px] uppercase tracking-[0.2em] hover:bg-ink hover:text-white transition-colors"
              >
                Clear Wishlist
              </button>
            )}
            <span className="font-mono-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Pg. 03
            </span>
          </div>
        </header>
        <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
          {wishlistLoading || offersLoading ? (
            <PreviewCardSkeleton count={3} />
          ) : wishlistItems.length > 0 ? (
            wishlistItems.map((item) => (
              <PreviewCard
                key={item._id}
                title={item.name}
                provider={(item as any)?.vendorBusinessId?.businessName}
                image={item.image}
                initials={item.name.slice(0, 2).toUpperCase()}
                meta={`₦${item.priceNaira.toLocaleString()}`}
                accent="wishlist"
                to={`/app/readmore/${item._id}`}
              />
            ))
          ) : (
            <EmptyState
              icon={Heart}
              title="Your wishlist is empty"
              description="Save your favorite offers to access them later"
              ctaText="Explore Offers"
              ctaLink="/app/offers"
            />
          )}
        </div>
      </section>

      {/* SUBS */}
      <section className="mb-4">
        <header className="flex items-baseline justify-between mb-6 pb-3 border-b-2 border-ink gap-3 flex-wrap">
          <h2 className="font-editorial text-3xl text-ink">Active Subs</h2>
          <div className="flex items-center gap-3">
            <Link
              to="/app/subs"
              className="group inline-flex items-center gap-1.5 font-mono-display text-[10px] uppercase tracking-[0.2em] text-ink hover:text-print-red transition-colors"
            >
              View all
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <span className="font-mono-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Pg. 04
            </span>
          </div>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subsLoading ? (
            <SubCardSkeleton count={3} />
          ) : subs.length > 0 ? (
            subs.map((sub: any) => {
              const serviceName = sub.serviceName ?? "Unknown Service";
              const expiresAt = sub.expiresAt ? new Date(sub.expiresAt).getTime() : null;
              const msLeft = expiresAt ? expiresAt - Date.now() : null;
              const isExpiring = msLeft !== null && msLeft < 1000 * 60 * 60 * 24 * 3;
              const totalMs = 30 * 24 * 60 * 60 * 1000;
              const pct =
                msLeft !== null
                  ? Math.max(0, Math.min(100, Math.round((msLeft / totalMs) * 100)))
                  : 100;
              const tone = sub.status !== "active" ? "orange" : isExpiring ? "orange" : "green";
              const statusLabel =
                sub.status !== "active" ? sub.status : isExpiring ? "Expires soon" : "Active";
              return (
                <SubCard
                  key={sub._id}
                  title={serviceName}
                  status={statusLabel}
                  tone={tone}
                  pct={pct}
                  daysLeft={msLeft !== null ? Math.max(0, Math.floor(msLeft / 86400000)) : null}
                />
              );
            })
          ) : (
            <div className="sm:col-span-2 lg:col-span-3">
              <EmptyState
                icon={Sparkles}
                title="No active subscriptions"
                description="Subscribe to an offer to see it here"
                ctaText="Browse Offers"
                ctaLink="/app/offers"
              />
            </div>
          )}
        </div>
      </section>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
      <ProfileModal open={profileOpen} onOpenChange={setProfileOpen} />
      <CheckoutModal
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        items={cartItems}
        onSuccess={handleCheckoutSuccess}
      />
    </div>
  );
};

/* ─────────────── SUB-COMPONENTS ─────────────── */

const EdStat = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ElementType;
}) => (
  <div className="border-2 border-ink bg-card px-4 py-3">
    <div className="flex items-center gap-2 mb-1 text-muted-foreground">
      <Icon className="h-3.5 w-3.5" />
      <p className="font-mono-display text-[10px] uppercase tracking-[0.2em]">{label}</p>
    </div>
    <p className="font-editorial text-2xl text-ink">{value}</p>
  </div>
);

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-ink/10 ${className}`} />
);

const HeroSkeleton = () => (
  <div className="relative border-2 border-ink/20 p-8 md:p-10 mb-12 bg-card flex items-center gap-5">
    <Skeleton className="h-16 w-16" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-3 w-32" />
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-3 w-64" />
    </div>
    <Skeleton className="h-10 w-24" />
  </div>
);

const PreviewCardSkeleton = ({ count = 3 }: { count?: number }) => (
  <>
    {[...Array(count)].map((_, i) => (
      <div
        key={i}
        className="shrink-0 snap-start w-[260px] h-[320px] flex flex-col border-2 border-ink/20 bg-card"
      >
        <div className="px-3 py-2 border-b-2 border-ink/20 flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-5 w-12" />
        </div>
        <div className="flex-1 flex items-center justify-center bg-ink/[0.02]">
          <Skeleton className="h-16 w-16 rounded-lg" />
        </div>
        <div className="px-3 py-2 border-t-2 border-ink/20 flex items-center justify-between">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    ))}
  </>
);

const SubCardSkeleton = ({ count = 3 }: { count?: number }) => (
  <>
    {[...Array(count)].map((_, i) => (
      <div
        key={i}
        className="border-2 border-ink/20 bg-card p-4 min-h-[120px] flex flex-col justify-between"
      >
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-1 w-full" />
        <div className="flex items-center justify-between mt-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-4 w-4" />
        </div>
      </div>
    ))}
  </>
);

const PreviewCard = ({
  title,
  provider,
  image,
  initials,
  meta,
  accent,
  to,
}: {
  title: string;
  provider: string;
  image?: string;
  initials: string;
  meta: string;
  accent: "cart" | "wishlist";
  to: string;
}) => (
  <Link
    to={to}
    className="shrink-0 snap-start w-[260px] h-[320px] flex flex-col border-2 border-ink bg-card hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow"
  >
    <div className="px-3 py-2 border-b-2 border-ink flex items-center justify-between gap-2">
      <p className="font-mono-display text-[10px] uppercase tracking-[0.2em] text-ink truncate">
        {provider}
      </p>
      <span
        className={cn(
          "font-mono-display text-[10px] uppercase tracking-[0.2em] px-2 py-1 border",
          accent === "cart" && "border-print-red text-print-red",
          accent === "wishlist" && "border-print-orange text-print-orange",
        )}
      >
        {accent}
      </span>
    </div>
    <div className="flex-1 bg-ink/[0.02] overflow-hidden relative">
      {image ? (
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center">
          <div className="h-16 w-16 border-2 border-ink/20 flex items-center justify-center font-editorial italic text-xl text-ink/40">
            {initials}
          </div>
        </div>
      )}
    </div>
    <div className="px-3 py-2 border-t-2 border-ink flex items-center justify-between">
      <p className="font-mono-display text-xs text-muted-foreground truncate">{title}</p>
      <p className="font-editorial italic text-sm text-ink">{meta}</p>
    </div>
  </Link>
);

const SubCard = ({
  title,
  status,
  tone,
  pct,
  daysLeft,
}: {
  title: string;
  status: string;
  tone: "green" | "orange";
  pct?: number;
  daysLeft?: number | null;
}) => (
  <div className="border-2 border-ink bg-card p-4 min-h-[120px] flex flex-col justify-between">
    <p className="font-editorial text-lg text-ink">{title}</p>
    {typeof pct === "number" && (
      <div className="mt-2">
        <div className="h-1 border border-ink/40 bg-paper overflow-hidden">
          <div
            className={cn(
              "h-full transition-all",
              tone === "green" ? "bg-green-600" : "bg-print-orange",
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
        {daysLeft !== null && daysLeft !== undefined && (
          <p className="font-mono-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
            {daysLeft}d left
          </p>
        )}
      </div>
    )}
    <div className="flex items-center justify-between mt-3">
      <span
        className={cn(
          "font-mono-display text-[10px] uppercase tracking-[0.2em] px-2 py-0.5 border-2",
          tone === "green"
            ? "border-green-600 text-green-700 bg-green-50"
            : "border-print-orange text-print-orange bg-paper",
        )}
      >
        {status}
      </span>
      <div
        className={cn(
          "h-2 w-2",
          tone === "green" ? "bg-green-600" : "bg-print-orange",
        )}
      />
    </div>
  </div>
);

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
      <ArrowRight className="h-4 w-4" />
    </Link>
  </div>
);

export default Dashboard;
