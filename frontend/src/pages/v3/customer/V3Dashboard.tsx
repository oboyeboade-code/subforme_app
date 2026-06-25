import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Settings,
  Pencil,
  ArrowRight,
  Heart,
  ShoppingBag,
  CreditCard,
  Zap,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import useSWR, { useSWRConfig } from "swr";

import { SettingsModal } from "@/components/app/SettingsModal";
import { ProfileModal } from "@/components/app/ProfileModal";

import { V3Card, V3Pill, V3SectionHeader } from "@/components/v3/V3UI";
import { V3CheckoutModal } from "@/components/v3/V3CheckoutModal";

import {
  cartApi,
  wishlistApi,
  userApi,
  serviceApi,
  type Service,
  type ServiceCode,
  type Profile,
  type IWishlistItem,
  ICartItem,
} from "@/lib/api/";

import { toast } from "@/hooks/use-toast";

const KEYS = {
  PROFILE: "profile",
  SERVICES: "services",
  CART: "customer/cart",
  WISHLIST: "customer/wishlist",
  MINE: "subs/me",
} as const;

const fetchProfile = () => userApi.getProfile().then((res) => res.data);
const fetchServices = () => serviceApi.listServices().then((res) => res.data.services || []);
const fetchCart = () => cartApi.getCart().then((res) => res.data.cart);
const fetchWishlist = () => wishlistApi.getWishlist().then((res) => res.data.wishlist);
const fetchSubs = () =>
  serviceApi.getSubscriptions().then((res) => res.data.subscriptions || []);

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

const fade: any = {
  hidden: { opacity: 0, y: 12 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.05 },
  }),
};

const V3Dashboard = () => {
  const { mutate: globalMutate } = useSWRConfig();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const {
    data: profileData,
    error: profileError,
    isLoading: profileLoading,
  } = useSWR<Profile>(KEYS.PROFILE, fetchProfile, {
    ...SWR_OPTS,
    onError: (err) =>
      toast.error({ title: "Profile error", description: err.message || "Try refreshing" }),
  });

  const {
    data: offers = [],
    error: offersError,
  } = useSWR<Service[]>(KEYS.SERVICES, fetchServices, {
    ...SWR_OPTS,
    onError: (err) =>
      toast.error({ title: "Failed to load services", description: err.message || "Try refreshing" }),
  });

  const {
    data: cart = [],
    error: cartError,
    isLoading: cartLoading,
    mutate: mutateCart,
  } = useSWR<ICartItem[]>(KEYS.CART, fetchCart, {
    ...SWR_OPTS,
    onError: (err) =>
      toast.error({ title: "Failed to load cart", description: err.message || "Try refreshing" }),
  });

  const {
    data: wishlist = [],
    error: wishlistError,
    isLoading: wishlistLoading,
    mutate: mutateWishlist,
  } = useSWR<IWishlistItem[]>(KEYS.WISHLIST, fetchWishlist, {
    ...SWR_OPTS,
    onError: (err) =>
      toast.error({ title: "Failed to load wishlist", description: err.message || "Try refreshing" }),
  });

  const {
    data: subscriptionsData = [],
    error: subsError,
    isLoading: subsLoading,
  } = useSWR<ServiceCode[]>(KEYS.MINE, fetchSubs, {
    ...SWR_OPTS,
    onError: (err) =>
      toast.error({ title: "Subscription error", description: err.message || "Try refreshing" }),
  });

  const hasError = profileError || offersError || cartError || wishlistError || subsError;

  const profile = {
    name: profileData?.name,
    email: profileData?.email,
    joined: profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : "",
  };

  const type = profileData?.subscriptionPlan;
  const subs = subscriptionsData || [];
  const activeSubsCount = subs.filter((s: any) => s?.status === "active").length;

  const cartMap = useMemo(
    () =>
      cart.reduce<Record<string, number>>((acc, item) => {
        acc[item.id] = item.qty;
        return acc;
      }, {}),
    [cart],
  );
  const wishlistSet = useMemo(() => new Set(wishlist.map((w) => w.id)), [wishlist]);

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

  const handleClearCart = async () => {
    try {
      await cartApi.clearCart();
      mutateCart([], false);
      toast.success({ title: "Cart cleared" });
    } catch (err: any) {
      toast.error({ title: "Failed", description: err.message });
    }
  };

  const handleClearWishlist = async () => {
    try {
      await wishlistApi.clearWishlist();
      mutateWishlist([], false);
      toast.success({ title: "Wishlist cleared" });
    } catch (err: any) {
      toast.error({ title: "Failed", description: err.message });
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
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-10 md:py-14">
        <V3EmptyState
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
    <div className="max-w-7xl mx-auto px-5 md:px-8 py-10 md:py-14">
      {/* HERO — matches V3AppHome welcome banner */}
      {profileLoading ? (
        <HeroSkeleton />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="relative overflow-hidden rounded-[24px] p-7 md:p-10 mb-12 text-paper bg-gradient-to-br from-print-red to-print-orange">
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 60%, white 1px, transparent 1px)",
                backgroundSize: "40px 40px, 32px 32px",
              }}
            />

            <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-5">
              <button
                onClick={() => setProfileOpen(true)}
                className="flex items-center gap-5 text-left group min-w-0"
              >
                <span className="h-16 w-16 rounded-2xl bg-paper/15 backdrop-blur border border-paper/25 flex items-center justify-center font-v3-display text-2xl text-paper shrink-0">
                  {initialsOf(profile.name)}
                </span>
                <div className="min-w-0">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-paper/15 backdrop-blur border border-paper/25 px-3 py-1 text-[11px] font-medium">
                    <Zap className="h-3 w-3" />
                    Your dashboard
                  </span>
                  <h1 className="font-v3-display mt-3 text-3xl md:text-4xl tracking-tight leading-[1.1] flex items-center gap-2 truncate">
                    {profile.name}
                    <Pencil className="h-4 w-4 opacity-0 group-hover:opacity-80 transition-opacity shrink-0" />
                  </h1>
                  <p className="mt-1.5 text-paper/80 text-sm truncate">
                    Joined {profile.joined} · {profile.email}
                  </p>
                </div>
              </button>

              <button
                onClick={() => setSettingsOpen(true)}
                className="inline-flex items-center gap-2 rounded-full bg-paper text-ink px-5 py-2.5 text-sm font-semibold hover:bg-paper/90 transition-colors shrink-0"
              >
                <Settings className="h-4 w-4" />
                Settings
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* PLAN CARD */}
      {!profileLoading && type && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          <V3Card className="p-5 mb-12 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-print-red/15 to-print-orange/15 flex items-center justify-center text-print-red">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-ink/50 mb-1">
                  Current Plan
                </p>
                <p className="font-v3-display text-2xl capitalize">
                  {type}{" "}
                  <span className="text-ink/40 text-base">
                    · {activeSubsCount} active sub{activeSubsCount === 1 ? "" : "s"}
                  </span>
                </p>
              </div>
            </div>
            {type !== "premium" && (
              <Link
                to="/v3/app/plans"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-print-red to-print-orange text-paper px-5 py-2.5 text-sm font-semibold hover:brightness-105 transition-all"
              >
                Upgrade to Premium <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </V3Card>
        </motion.div>
      )}

      {/* STATS */}
      <section className="mb-14">
        <V3SectionHeader eyebrow="At a glance" title="Your activity" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <StatCard icon={CreditCard} label="Cart Total" value={`₦${cartTotal.toLocaleString()}`} i={0} />
          <StatCard icon={Heart} label="Wishlist" value={wishlistItems.length} i={1} />
          <StatCard icon={Sparkles} label="Active Subs" value={activeSubsCount} i={2} />
          <StatCard icon={TrendingUp} label="Items in Cart" value={cartItems.length} i={3} />
        </div>
      </section>

      {/* CART */}
      <section className="mb-14">
        <V3SectionHeader
          eyebrow="Cart"
          title="Ready to checkout"
          meta={cartItems.length > 0 ? `${cartItems.length} item${cartItems.length === 1 ? "" : "s"}` : undefined}
        />
        {!cartLoading && cartItems.length > 0 && (
          <div className="flex items-center justify-end gap-3 mb-5">
            <button
              type="button"
              onClick={handleClearCart}
              className="inline-flex items-center rounded-full border border-ink/15 px-4 py-2 text-xs font-medium text-ink/70 hover:bg-ink/[0.06] hover:border-ink/30 transition-colors"
            >
              Clear cart
            </button>
            <button
              type="button"
              onClick={() => setCheckoutOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-print-red to-print-orange text-paper px-5 py-2 text-xs font-semibold hover:brightness-105 transition-all"
            >
              <CreditCard className="h-3.5 w-3.5" />
              Checkout
            </button>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cartLoading ? (
            <PreviewCardSkeleton count={3} />
          ) : cartItems.length > 0 ? (
            cartItems.map((item, i) => (
              <V3PreviewCard
                key={item._id}
                title={`${item.name} × ${item.qty}`}
                provider={(item as any)?.vendorBusinessId?.businessName}
                image={item.image}
                initials={item.name.slice(0, 2).toUpperCase()}
                meta={`₦${(item.priceNaira * item.qty).toLocaleString("en-NG")}`}
                accent="cart"
                to={`/v3/app/readmore/${item._id}`}
                i={i}
              />
            ))
          ) : (
            <V3EmptyState
              icon={ShoppingBag}
              title="Your cart is empty"
              description="Add items from Offers to see them here"
              ctaText="Browse Offers"
              ctaLink="/v3/app/offers"
            />
          )}
        </div>
      </section>

      {/* WISHLIST */}
      <section className="mb-14">
        <V3SectionHeader
          eyebrow="Wishlist"
          title="Saved for later"
          meta={wishlistItems.length > 0 ? `${wishlistItems.length} item${wishlistItems.length === 1 ? "" : "s"}` : undefined}
        />
        {!wishlistLoading && wishlistItems.length > 0 && (
          <div className="flex items-center justify-end mb-5">
            <button
              type="button"
              onClick={handleClearWishlist}
              className="inline-flex items-center rounded-full border border-ink/15 px-4 py-2 text-xs font-medium text-ink/70 hover:bg-ink/[0.06] hover:border-ink/30 transition-colors"
            >
              Clear wishlist
            </button>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {wishlistLoading ? (
            <PreviewCardSkeleton count={3} />
          ) : wishlistItems.length > 0 ? (
            wishlistItems.map((item, i) => (
              <V3PreviewCard
                key={item._id}
                title={item.name}
                provider={(item as any)?.vendorBusinessId?.businessName}
                image={item.image}
                initials={item.name.slice(0, 2).toUpperCase()}
                meta={`₦${item.priceNaira.toLocaleString()}`}
                accent="wishlist"
                to={`/v3/app/readmore/${item._id}`}
                i={i}
              />
            ))
          ) : (
            <V3EmptyState
              icon={Heart}
              title="Your wishlist is empty"
              description="Save your favorite offers to access them later"
              ctaText="Explore Offers"
              ctaLink="/v3/app/offers"
            />
          )}
        </div>
      </section>

      {/* SUBS */}
      <section>
        <V3SectionHeader
          eyebrow="Subscriptions"
          title="Active subs"
          meta={subs.length > 0 ? `${subs.length} total` : undefined}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {subsLoading ? (
            <SubCardSkeleton count={3} />
          ) : subs.length > 0 ? (
            subs.map((sub: any, i: number) => {
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
                  i={i}
                />
              );
            })
          ) : (
            <V3EmptyState
              icon={Sparkles}
              title="No active subscriptions"
              description="Subscribe to an offer to see it here"
              ctaText="Browse Offers"
              ctaLink="/v3/app/offers"
            />
          )}
        </div>
      </section>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
      <ProfileModal open={profileOpen} onOpenChange={setProfileOpen} />
      <V3CheckoutModal
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        items={cartItems}
        onSuccess={handleCheckoutSuccess}
      />
    </div>
  );
};

/* ─────────────── SUB-COMPONENTS ─────────────── */

const StatCard = ({
  icon: Icon,
  label,
  value,
  i = 0,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  i?: number;
}) => (
  <motion.div variants={fade} initial="hidden" animate="show" custom={i}>
    <V3Card className="p-5 h-full">
      <div className="flex items-center gap-2 mb-2 text-ink/50">
        <Icon className="h-3.5 w-3.5" />
        <p className="text-[11px] uppercase tracking-[0.2em]">{label}</p>
      </div>
      <p className="font-v3-display text-3xl text-ink">{value}</p>
    </V3Card>
  </motion.div>
);

const V3PreviewCard = ({
  title,
  provider,
  image,
  initials,
  meta,
  accent,
  to,
  i = 0,
}: {
  title: string;
  provider: string;
  image?: string;
  initials: string;
  meta: string;
  accent: "cart" | "wishlist";
  to: string;
  i?: number;
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
  }, [image]);

  return (
    <motion.div variants={fade} initial="hidden" animate="show" custom={i}>
      <Link
        to={to}
        className="group flex flex-col h-full rounded-[18px] border border-ink/12 bg-paper overflow-hidden hover:border-print-red/30 hover:shadow-[0_12px_28px_-16px_hsl(var(--ink)/0.25)] transition-all"
      >
        <div className="px-4 py-3 border-b border-ink/12 flex items-center justify-between gap-2">
          <p className="text-[11px] font-medium text-ink/40 uppercase tracking-wider truncate">
            {provider}
          </p>
          <V3Pill tone={accent === "cart" ? "red" : "orange"} className="text-[10px] py-0.5 px-2">
            {accent}
          </V3Pill>
        </div>
        <div className="flex-1 min-h-[160px] bg-ink/[0.02] flex items-center justify-center relative overflow-hidden">
          {!imageError && image ? (
            <img
              src={image}
              alt={title}
              className={cn(
                "absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105",
                imageLoaded ? "opacity-100" : "opacity-0",
              )}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="font-v3-display text-3xl text-ink/15 italic select-none">{initials}</div>
          )}
        </div>
        <div className="px-4 py-3 border-t border-ink/12 flex items-center justify-between bg-paper group-hover:bg-ink/[0.01] transition-colors">
          <p className="text-sm font-medium text-ink truncate pr-2">{title}</p>
          <p className="font-v3-display text-sm text-print-red shrink-0">{meta}</p>
        </div>
      </Link>
    </motion.div>
  );
};

const SubCard = ({
  title,
  status,
  tone,
  pct,
  daysLeft,
  i = 0,
}: {
  title: string;
  status: string;
  tone: "green" | "orange";
  pct?: number;
  daysLeft?: number | null;
  i?: number;
}) => (
  <motion.div variants={fade} initial="hidden" animate="show" custom={i}>
    <V3Card className="p-5 flex flex-col justify-between min-h-[140px] h-full hover:border-print-red/20 transition-colors">
      <p className="font-medium text-ink leading-tight">{title}</p>
      {typeof pct === "number" && (
        <div className="mt-3">
          <div className="h-1 rounded-full bg-ink/8 overflow-hidden">
            <div
              className={cn(
                "h-full transition-all",
                tone === "green" ? "bg-green-500" : "bg-print-orange",
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
          {daysLeft !== null && daysLeft !== undefined && (
            <p className="text-[10px] text-ink/45 mt-1">{daysLeft}d left</p>
          )}
        </div>
      )}
      <div className="flex items-center justify-between mt-3">
        <V3Pill tone={tone} className="text-[10px] uppercase tracking-wider">
          {status}
        </V3Pill>
        <div
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            tone === "green"
              ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"
              : "bg-print-orange shadow-[0_0_8px_rgba(249,115,22,0.4)]",
          )}
        />
      </div>
    </V3Card>
  </motion.div>
);

interface V3EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
}

const V3EmptyState = ({ icon: Icon, title, description, ctaText, ctaLink }: V3EmptyStateProps) => (
  <div className="w-full sm:col-span-2 lg:col-span-3 text-center py-12 rounded-[18px] border border-ink/12 bg-ink/[0.02]">
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

const HeroSkeleton = () => (
  <div className="relative overflow-hidden rounded-[24px] p-7 md:p-10 mb-12 bg-ink/5 animate-pulse min-h-[180px]" />
);

const PreviewCardSkeleton = ({ count = 3 }: { count?: number }) => (
  <>
    {[...Array(count)].map((_, i) => (
      <div
        key={i}
        className="flex flex-col rounded-[18px] border border-ink/12 bg-paper overflow-hidden animate-pulse h-[280px]"
      >
        <div className="px-4 py-3 border-b border-ink/12 flex items-center justify-between">
          <div className="h-3 w-20 bg-ink/5 rounded" />
          <div className="h-5 w-12 bg-ink/5 rounded-full" />
        </div>
        <div className="flex-1 bg-ink/[0.02]" />
        <div className="px-4 py-3 border-t border-ink/12 flex items-center justify-between">
          <div className="h-4 w-24 bg-ink/5 rounded" />
          <div className="h-4 w-16 bg-ink/5 rounded" />
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
        className="p-5 flex flex-col justify-between min-h-[140px] rounded-[18px] border border-ink/12 bg-paper animate-pulse"
      >
        <div className="h-4 w-3/4 bg-ink/5 rounded" />
        <div className="h-1 w-full bg-ink/5 rounded mt-3" />
        <div className="flex items-center justify-between mt-3">
          <div className="h-5 w-16 bg-ink/5 rounded-full" />
          <div className="h-1.5 w-1.5 rounded-full bg-ink/5" />
        </div>
      </div>
    ))}
  </>
);

export default V3Dashboard;
