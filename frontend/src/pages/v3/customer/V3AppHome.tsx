import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import useSWR from "swr";
import { toast } from "@/hooks/use-toast";
import { ArrowRight, Zap, AlertCircle } from "lucide-react";
import { homeApi, type IPlatformMetric, type TopProvider, type AppCategory } from "@/lib/api";

import {
  UtensilsCrossed as _U,
  Coffee as _C,
  ShoppingCart as _S,
  Car as _Ca,
  Film as _F,
  Sparkles as _Sp,
} from "lucide-react";

const _CAT_ICONS = {
  UtensilsCrossed: _U,
  Coffee: _C,
  ShoppingCart: _S,
  Car: _Ca,
  Film: _F,
  Sparkles: _Sp,
} as const;

import {
  V3Card,
  V3Pill,
  V3SectionHeader,
} from "@/components/v3/V3UI";
import { useEffect, useState } from "react";

const KEYS = {
  V3_TOP_PROVIDERS: "/top-providers",
  V3_CATEGORIES: "/categories",
  V3_PLATFORM_METRICS: "/platform-metrics",
} as const;

/* ---------------- FETCHERS ---------------- */

const fetchers = {
  [KEYS.V3_TOP_PROVIDERS]: async (): Promise<TopProvider[]> => {
    const res = await homeApi.getTopProviders();
    return res.data;
  },

  [KEYS.V3_CATEGORIES]: async (): Promise<AppCategory[]> => {
    const res = await homeApi.getCategories();
    return res.data;
  },

  [KEYS.V3_PLATFORM_METRICS]: async (): Promise<IPlatformMetric> => {
    const res = await homeApi.getPlatformMetrics();
    return res.data;
  },
};

/* ---------------- ANIM ---------------- */

const fade: any = {
  hidden: { opacity: 0, y: 12 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      delay: i * 0.05,
    },
  }),
};

/* ---------------- SKELETONS ---------------- */

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-ink/10 ${className}`} />
);

const V3TopProvidersSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
    {[...Array(3)].map((_, i) => (
      <motion.div
        key={i}
        variants={fade}
        initial="hidden"
        animate="show"
        custom={i}
      >
        <V3Card className="p-0 overflow-hidden h-full">
          <Skeleton className="h-28 w-full" />
          <div className="p-5">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </V3Card>
      </motion.div>
    ))}
  </div>
);

const V3CategoriesSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
    {[...Array(6)].map((_, i) => (
      <motion.div
        key={i}
        variants={fade}
        initial="hidden"
        animate="show"
        custom={i}
      >
        <V3Card className="p-0 aspect-square flex flex-col items-center justify-center gap-3">
          <Skeleton className="h-12 w-12 rounded-2xl" />
          <Skeleton className="h-4 w-16" />
        </V3Card>
      </motion.div>
    ))}
  </div>
);

const V3PlatformMetricsSkeleton = () => (
  <div className="space-y-5">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          variants={fade}
          initial="hidden"
          animate="show"
          custom={i}
        >
          <V3Card className="p-5">
            <Skeleton className="h-3 w-1/3 mb-3" />
            <Skeleton className="h-9 w-1/2" />
          </V3Card>
        </motion.div>
      ))}
    </div>
    <motion.div variants={fade} custom={3}>
      <V3Card className="p-5">
        <Skeleton className="h-3 w-1/4 mb-4" />
        <div className="flex flex-wrap gap-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-6 w-20 rounded-full" />
          ))}
        </div>
      </V3Card>
    </motion.div>
  </div>
);

/* ---------------- EXTRACTED CARD COMPONENT - Fixes Error #31 ---------------- */

const TopProviderCard = ({ p, i }: { p: TopProvider; i: number }) => {
  const initials = p.providerName
 .split(' ')
 .map(w => w[0])
 .join('')
 .slice(0, 2)
 .toUpperCase();

  const [imgError, setImgError] = useState(false);

  // Option 1: Cycle through brand colors based on index
  const hueVariants = [
    'from-print-red/20 to-print-orange/20',
    'from-print-orange/20 to-print-green/20',
    'from-print-green/20 to-ink/20',
    'from-ink/20 to-print-red/20',
  ];
  // const hue = hueVariants[i % hueVariants.length];

  // Option 2: Generate from provider name - deterministic per provider
  const hash = p.providerName.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const hue = hueVariants[hash % hueVariants.length];

  // Option 3: Based on service count - more services = warmer
  // const hue = p.services.length > 2
  //? 'from-print-red/20 to-print-orange/20'
  // : 'from-ink/10 to-ink/20';

  return (
    <motion.div
      variants={fade}
      initial="hidden"
      animate="show"
      custom={i}
    >
      <V3Card className="p-0 overflow-hidden h-full">
        <div className={`h-28 bg-gradient-to-br ${hue} flex items-center justify-center relative`}>
          {p.logoUrl &&!imgError? (
            <img
              src={p.logoUrl}
              alt={p.providerName}
              className="h-16 w-16 rounded-full object-cover border-2 border-paper"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="font-v3-display text-5xl text-ink/45">
              {initials}
            </span>
          )}
          <div className="absolute top-3 right-3">
            <V3Pill tone="ink" className="bg-paper/90 text-ink border-paper/40 text-xs">
              #{String(i + 1).padStart(2, "0")}
            </V3Pill>
          </div>
        </div>

        <div className="p-5 space-y-3">
          <h3 className="font-v3-display text-xl text-ink truncate">
            {p.providerName}
          </h3>

          {p.services.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {p.services.slice(0, 3).map((service, idx) => (
                <V3Pill key={idx} tone="ink" className="text-xs">
                  {service}
                </V3Pill>
              ))}
              {p.services.length > 3 && (
                <V3Pill tone="ink" className="text-xs">
                  +{p.services.length - 3}
                </V3Pill>
              )}
            </div>
          )}
        </div>
      </V3Card>
    </motion.div>
  );
};

/* ---------------- COMPONENT ---------------- */

const V3AppHome = () => {
  const {
    data: topProviders = [],
    error: providersError,
    isLoading: providersLoading,
  } = useSWR<TopProvider[]>(
    KEYS.V3_TOP_PROVIDERS,
    fetchers[KEYS.V3_TOP_PROVIDERS],
    {
      onError: (err) =>
        toast.error({
          title: "Failed to load top providers",
          description: err.message || "Try refreshing",
        }),
      revalidateOnFocus: false,
    }
  );

  const {
    data: categories = [],
    error: categoriesError,
    isLoading: categoriesLoading,
  } = useSWR<AppCategory[]>(
    KEYS.V3_CATEGORIES,
    fetchers[KEYS.V3_CATEGORIES],
    {
      onError: (err) =>
        toast.error({
          title: "Failed to load categories",
          description: err.message || "Try refreshing",
        }),
      revalidateOnFocus: false,
    }
  );

  const {
    data: platformMetrics,
    error: metricsError,
    isLoading: metricsLoading,
  } = useSWR<IPlatformMetric>(
    KEYS.V3_PLATFORM_METRICS,
    fetchers[KEYS.V3_PLATFORM_METRICS],
    {
      onError: (err) =>
        toast.error({
          title: "Failed to load platform metrics",
          description: err.message || "Try refreshing",
        }),
      revalidateOnFocus: false,
    }
  );

  const isLoading = providersLoading || categoriesLoading || metricsLoading;
  const hasError = providersError || categoriesError || metricsError;

  if (hasError &&!isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-10 md:py-14">
        <V3EmptyState
          icon={AlertCircle}
          title="Could not load home"
          description="Something went wrong fetching your data"
          ctaText="Refresh Page"
          ctaLink=""
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-8 py-10 md:py-14">
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
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-paper/15 backdrop-blur border border-paper/25 px-3 py-1 text-[11px] font-medium">
                <Zap className="h-3 w-3" />
                Welcome back
              </span>

              <h1 className="font-v3-display mt-4 text-4xl md:text-5xl tracking-tight leading-[1.05]">
                Ready to redeem?
              </h1>

              <p className="mt-2 text-paper/85 text-sm">
                Pick a vendor or browse offers.
              </p>
            </div>

            <Link
              to="/v3/app/voucher"
              className="inline-flex items-center gap-2 rounded-full bg-paper text-ink px-5 py-2.5 text-sm font-semibold hover:bg-paper/90 transition-colors"
            >
              Buy voucher
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Platform Metrics Section */}
      <section className="mb-14">
        <V3SectionHeader
          eyebrow="Platform stats"
          title="Live metrics"
          meta={platformMetrics? `Week ${platformMetrics.weekIdentifier.split('-').pop()}` : undefined}
        />

        {metricsLoading? (
          <V3PlatformMetricsSkeleton />
        ) : platformMetrics? (
          <motion.div
            className="space-y-5"
            variants={fade}
            initial="hidden"
            animate="show"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <motion.div variants={fade} custom={0}>
                <V3Card className="p-5 h-full">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-ink/50 mb-2">
                    Active Users
                  </p>
                  <p className="font-v3-display text-3xl text-ink">
                    {platformMetrics.activeUsersCount?.toLocaleString()?? "—"}
                  </p>
                </V3Card>
              </motion.div>

              <motion.div variants={fade} custom={1}>
                <V3Card className="p-5 h-full">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-ink/50 mb-2">
                    Total Revenue
                  </p>
                  <p className="font-v3-display text-3xl text-ink">
                    ₦{(platformMetrics.totalRevenue || 0).toLocaleString()}
                  </p>
                </V3Card>
              </motion.div>

              <motion.div variants={fade} custom={2}>
                <V3Card className="p-5 h-full flex flex-col justify-between">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-ink/50 mb-2">
                    System Status
                  </p>
                  <div className="flex items-end justify-between">
                    <V3Pill
                      tone={
                        platformMetrics.systemHealthStatus === "healthy"
                        ? "green"
                          : platformMetrics.systemHealthStatus === "degraded"
                        ? "orange"
                          : "red"
                      }
                    >
                      {platformMetrics.systemHealthStatus || "Unknown"}
                    </V3Pill>
                    <Zap className="h-5 w-5 text-print-orange" />
                  </div>
                </V3Card>
              </motion.div>
            </div>

            {(platformMetrics.topProviders?.length || platformMetrics.mostOrderedServices?.length)? (
              <motion.div variants={fade} custom={3}>
                <V3Card className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {platformMetrics.topProviders?.length? (
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.2em] text-ink/50 mb-3">
                          Top Providers
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {platformMetrics.topProviders.map((provider) => (
                            <V3Pill key={provider.id} tone="ink">{provider.providerName}</V3Pill>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {platformMetrics.mostOrderedServices?.length? (
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.2em] text-ink/50 mb-3">
                          Trending Services
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {platformMetrics.mostOrderedServices.map((service) => (
                            <V3Pill key={service} tone="orange">{service}</V3Pill>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </V3Card>
              </motion.div>
            ) : null}
          </motion.div>
        ) : (
          <p className="text-sm text-muted-foreground">No metrics available</p>
        )}
      </section>

      <section className="mb-14">
        <V3SectionHeader
          eyebrow="Providers"
          title="Hot this week"
          meta={`${topProviders.length} vendors`}
        />

      {providersLoading? (
        <V3TopProvidersSkeleton />
      ) : topProviders.length > 0? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {topProviders.map((p, i) => (
            <TopProviderCard key={p.id} p={p} i={i} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No top providers available</p>
      )}
      </section>

      <section>
        <V3SectionHeader
          eyebrow="Categories"
          title="Browse by type"
        />

        {categoriesLoading? (
          <V3CategoriesSkeleton />
        ) : categories.length > 0? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((c, i) => {
              const Icon = _CAT_ICONS[c.iconName as keyof typeof _CAT_ICONS]?? _Sp;
              return (
                <motion.div
                  key={c.name}
                  variants={fade}
                  initial="hidden"
                  animate="show"
                  custom={i}
                >
                  <Link
                    to={`/v3/app/offers?category=${encodeURIComponent(c.name)}`}
                    className="block"
                  >
                    <V3Card className="p-0 aspect-square flex flex-col items-center justify-center gap-3 hover:shadow-soft transition-shadow">
                      <span className="h-12 w-12 rounded-2xl bg-gradient-to-br from-print-red/15 to-print-orange/15 flex items-center justify-center text-print-red">
                        <Icon className="h-5 w-5" />
                      </span>

                      <span className="text-sm font-medium text-center px-2">
                        {c.name}
                      </span>
                    </V3Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No categories available</p>
        )}
      </section>
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
    <p className="text-ink/55 text-sm mb-6">
      {description}
    </p>
    <Link
      to={ctaLink}
      className="inline-flex items-center gap-2 bg-gradient-to-br from-print-red to-print-orange text-paper px-6 py-2.5 rounded-full font-medium text-sm hover:brightness-105 transition-all"
    >
      {ctaText}
      <ArrowRight className="h-4 w-4" />
    </Link>
  </div>
);

export default V3AppHome;