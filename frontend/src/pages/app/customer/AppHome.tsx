import { Link } from "react-router-dom";
import { ReactNode } from "react";
import useSWR from "swr";
import { toast } from "@/hooks/use-toast";
import { homeApi, type IPlatformMetric, type AppCategory, type TopProvider } from "@/lib/api/";
import { AlertCircle, ArrowRight, Zap } from "lucide-react";

const KEYS = {
  TOP_PROVIDERS: "/top-providers",
  CATEGORIES: "/categories",
  PLATFORM_METRICS: "/platform-metrics",
} as const;

const fetchers = {
  [KEYS.TOP_PROVIDERS]: async (): Promise<TopProvider[]> => {
    const res = await homeApi.getTopProviders();
    return res.data;
  },

  [KEYS.CATEGORIES]: async (): Promise<AppCategory[]> => {
    const res = await homeApi.getCategories();
    return res.data;
  },

  [KEYS.PLATFORM_METRICS]: async (): Promise<IPlatformMetric> => {
    const res = await homeApi.getPlatformMetrics();
    return res.data;
  },
};

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-ink/10 ${className}`} />
);

const PlatformMetricsSkeleton = () => (
  <section className="mb-12 pb-8 border-b-2 border-ink">
    <header className="mb-6 pb-3 border-b-2 border-ink flex items-baseline justify-between">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-3 w-20" />
    </header>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="border-2 border-ink bg-card px-4 py-3">
          <Skeleton className="h-3 w-24 mb-2" />
          <Skeleton className="h-8 w-32" />
        </div>
      ))}
    </div>
  </section>
);

const TopProvidersSkeleton = () => (
  <>
    {[...Array(5)].map((_, i) => (
      <div key={i} className="border-2 border-ink/20 bg-card px-4 py-3">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    ))}
  </>
);

const CategoriesSkeleton = () => (
  <>
    {[...Array(6)].map((_, i) => (
      <div
        key={i}
        className="aspect-[4/3] border-2 border-ink/20 flex items-center justify-center"
      >
        <Skeleton className="h-4 w-2/3" />
      </div>
    ))}
  </>
);

interface ProviderWrapperProps {
  item: {
    id: string;
  };
  enableNavigation?: boolean;
  children: ReactNode;
}

const ProviderWrapper = ({
  item,
  enableNavigation = false,
  children,
}: ProviderWrapperProps) => {
  const className =
    "group flex items-center gap-3 border-2 border-ink bg-card px-4 py-3 hover:bg-ink hover:text-paper transition-colors";

  return enableNavigation ? (
    <Link to={`/app/readmore/${item.id}`} className={className}>
      {children}
    </Link>
  ) : (
    <div className={className}>
      {children}
    </div>
  );
};

const AppHome = () => {
  const {
    data: topProviders = [],
    error: providersError,
    isLoading: providersLoading,
  } = useSWR<TopProvider[]>(
    KEYS.TOP_PROVIDERS,
    fetchers[KEYS.TOP_PROVIDERS],
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
    KEYS.CATEGORIES,
    fetchers[KEYS.CATEGORIES],
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
    KEYS.PLATFORM_METRICS,
    fetchers[KEYS.PLATFORM_METRICS],
    {
      onError: (err) =>
        toast.error({
          title: "Failed to load platform metrics",
          description: err.message || "Try refreshing",
        }),
      revalidateOnFocus: false,
    }
  );

  // Remove global isLoading check - handle per section instead
  const hasError =
    providersError &&
    categoriesError &&
    metricsError;

  if (hasError) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10">
        <EmptyState
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
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Hero Section with Buy Voucher Button */}
      <div className="relative border-2 border-ink p-8 md:p-10 mb-12 bg-card overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 border border-ink/20 bg-ink/5 px-3 py-1 font-mono-display text-[10px] uppercase tracking-wider text-ink/70">
              <Zap className="h-3 w-3" />
              Welcome back
            </span>

            <h1 className="font-editorial mt-4 text-4xl md:text-5xl text-ink leading-[1.1]">
              Ready to redeem?
            </h1>

            <p className="mt-2 text-ink/60 font-mono-display text-xs uppercase tracking-wider">
              Pick a vendor or browse offers.
            </p>
          </div>

          <Link
            to="/app/voucher"
            className="inline-flex items-center gap-2 bg-print-red text-paper px-6 py-3 border-2 border-print-red font-mono-display text-xs uppercase tracking-wider hover:bg-ink hover:border-ink transition-all"
          >
            Buy voucher
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        
        {/* Background Texture/Pattern to match the editorial style */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none" 
          style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, black 1px, transparent 0)",
            backgroundSize: "24px 24px"
          }}
        />
      </div>

      {metricsLoading ? (
        <PlatformMetricsSkeleton />
      ) : platformMetrics ? (
        <section className="mb-12 pb-8 border-b-2 border-ink">
          <header className="mb-6 pb-3 border-b-2 border-ink flex items-baseline justify-between">
            <h2 className="font-editorial text-2xl text-ink">
              Platform Metrics
            </h2>

            <span className="font-mono-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Week {platformMetrics.weekIdentifier}
            </span>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border-2 border-ink bg-card px-4 py-3">
              <p className="font-mono-display text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                Active Users
              </p>

              <p className="font-editorial text-2xl text-ink">
                {platformMetrics.activeUsersCount?.toLocaleString() ?? "N/A"}
              </p>
            </div>

            <div className="border-2 border-ink bg-card px-4 py-3">
              <p className="font-mono-display text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                Total Revenue
              </p>

              <p className="font-editorial text-2xl text-ink">
                ₦{(platformMetrics.totalRevenue ?? 0).toLocaleString()}
              </p>
            </div>

            <div className="border-2 border-ink bg-card px-4 py-3">
              <p className="font-mono-display text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                System Status
              </p>

              <p
                className={`font-editorial text-2xl capitalize ${
                  platformMetrics.systemHealthStatus === "healthy"
                    ? "text-green-600"
                    : "text-print-orange"
                }`}
              >
                {platformMetrics.systemHealthStatus ?? "Unknown"}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-0 md:divide-x-2 md:divide-ink">
        <section className="md:pr-10">
          <header className="mb-6 pb-3 border-b-2 border-ink flex items-baseline justify-between">
            <h1 className="font-editorial text-3xl text-ink">
              Top Providers
            </h1>

            <span className="font-mono-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Pg. 01
            </span>
          </header>

          <div className="space-y-3">
            {providersLoading? (
              <TopProvidersSkeleton />
            ) : topProviders.length > 0? (
              topProviders.map((item, i) => {
                const initials = item.providerName
                .split(' ')
                .map(w => w[0])
                .join('')
                .slice(0, 2)
                .toUpperCase();

                // return (
                  // <Link
                  //   key={item.id}
                  //   to={`/app/readmore/${item.id}`}
                  //   className="group flex items-center gap-3 border-2 border-ink bg-card px-4 py-3 hover:bg-ink hover:text-paper transition-colors"
                  // >
                  //   {/* Logo/Initials - matches V3 logic */}
                  //   <div className="h-10 w-10 rounded-full bg-ink/5 flex items-center justify-center shrink-0 group-hover:bg-paper/10">
                  //     {item.logoUrl? (
                  //       <img
                  //         src={item.logoUrl}
                  //         alt={item.providerName}
                  //         className="h-10 w-10 rounded-full object-cover"
                  //         onError={(e) => {
                  //           e.currentTarget.style.display = 'none';
                  //         }}
                  //       />
                  //     ) : (
                  //       <span className="text-xs font-bold text-ink/60 group-hover:text-paper/60">
                  //         {initials}
                  //       </span>
                  //     )}
                  //   </div>

                  //   {/* Provider-first layout - matches V3 */}
                  //   <div className="flex-1 min-w-0">
                  //     <p className="font-editorial text-lg text-ink group-hover:text-paper truncate">
                  //       {item.providerName}
                  //     </p>
                  //     <p className="font-mono-display text-[10px] uppercase tracking-wider text-muted-foreground group-hover:text-paper/80 truncate">
                  //       {item.services[0]}
                  //       {item.services.length > 1 && ` +${item.services.length - 1}`}
                  //     </p>
                  //   </div>

                  //   {/* Standardized rank format: #01 */}
                  //   <span className="font-mono-display text-[10px] uppercase tracking-widest text-muted-foreground group-hover:text-paper shrink-0">
                  //     #{String(i + 1).padStart(2, "0")}
                  //   </span>
                  // </Link>
                  return (
                    <ProviderWrapper
                      key={item.id}
                      item={item}
                      enableNavigation={false}
                    >
                      {/* Logo/Initials */}
                      <div className="h-10 w-10 rounded-full bg-ink/5 flex items-center justify-center shrink-0 group-hover:bg-paper/10">
                        {item.logoUrl ? (
                          <img
                            src={item.logoUrl}
                            alt={item.providerName}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-bold text-ink/60 group-hover:text-paper/60">
                            {initials}
                          </span>
                        )}
                      </div>

                      {/* Provider info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-editorial text-lg text-ink group-hover:text-paper truncate">
                          {item.providerName}
                        </p>
                        <p className="font-mono-display text-[10px] uppercase tracking-wider text-muted-foreground group-hover:text-paper/80 truncate">
                          {item.services[0]}
                          {item.services.length > 1 &&
                            ` +${item.services.length - 1}`}
                        </p>
                      </div>

                      {/* Rank */}
                      <span className="font-mono-display text-[10px] uppercase tracking-widest text-muted-foreground group-hover:text-paper shrink-0">
                        #{String(i + 1).padStart(2, "0")}
                      </span>
                    </ProviderWrapper>
                  );
                // );
              })
            ) : (
              <p className="text-sm text-muted-foreground">
                No top providers available
              </p>
            )}
          </div>
        </section>

        <section className="md:pl-10">
          <header className="mb-6 pb-3 border-b-2 border-ink flex items-baseline justify-between">
            <h1 className="font-editorial text-3xl text-ink">
              Category
            </h1>

            <span className="font-mono-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Pg. 02
            </span>
          </header>

          <div className="grid grid-cols-2 gap-3">
            {categoriesLoading ? (
              <CategoriesSkeleton />
            ) : categories.length > 0 ? (
              categories.map((cat, i) => (
                <Link
                  key={`${cat.name}-${i}`}
                  to={`/app/offers?category=${cat.name}`} // Fixed: was passing object instead of name
                  className={`aspect-[4/3] border-2 border-ink flex items-center justify-center font-mono-display text-sm uppercase tracking-[0.2em] transition-colors ${
                    i % 3 === 0
                      ? "bg-print-red text-primary-foreground hover:bg-print-red/90"
                      : i % 3 === 1
                        ? "bg-print-orange text-accent-foreground hover:bg-print-orange/90"
                        : "bg-card text-ink hover:bg-ink hover:text-paper"
                  }`}
                >
                  {cat.name}
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground col-span-2">
                No categories available
              </p>
            )}
          </div>
        </section>
      </div>
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
      <ArrowRight className="h-4 w-4" />
    </Link>
  </div>
);

export default AppHome;
