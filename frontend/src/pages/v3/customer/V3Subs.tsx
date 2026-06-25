import { useEffect, useState } from "react";
import useSWR from "swr";
import { motion } from "framer-motion";
import { Eye, EyeOff, RefreshCw, AlertCircle } from "lucide-react";
import { V3Card, V3Pill, V3Button, V3SectionHeader } from "@/components/v3/V3UI";
import { cn } from "@/lib/utils";
import { serviceApi, type ServiceCode } from "@/lib/api/";
import { V3ConfirmNavLink } from "@/components/v3/V3ConfirmNavLink";

const subsFetcher = async (): Promise<ServiceCode[]> =>
  serviceApi.getSubscriptions().then(res => res.data.subscriptions);

const maskCode = (c: string) => {
  if (!c) return "";
  // We only show the first 2 letters and the rest as "XXXXXX" 
  // to give the illusion of security without fetching real codes
  return `${c.slice(0, 2)}-XXXXXX`;
};

const SubCard = ({ sub }: { sub: any }) => {
  const [revealed, setRevealed] = useState(false);
  
  const isExpiringSoon = sub.status === "active" && sub.expiresAt && 
    (new Date(sub.expiresAt).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000); // 7 days threshold

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
      <V3Card className="p-0 overflow-hidden">
        <div
          className={cn(
            "px-5 py-4 flex items-center justify-between border-b border-ink/5",
            sub.status === "active" && "bg-gradient-to-r from-print-green/10 to-print-green/5",
            sub.status === "used" && "bg-ink/[0.03]",
            sub.status === "expired" && "bg-ink/[0.03]",
          )}
        >
          <div className="flex flex-col">
            <h3 className="font-v3-display text-lg">
              <V3ConfirmNavLink
                to={`/v3/app/readmore/${sub.serviceId}`}
                confirmTitle="Leave to Bookings Page?"
                confirmDescription="You want to book this service one more time ?"
              >
                <span className="text-sm text-print-red hover:underline">{sub.serviceName}</span>
              </V3ConfirmNavLink>
              {/* <Link to={`/v3/app/readmore/${sub.serviceName}`}>{sub.serviceName}</Link> */}
            </h3>
            {isExpiringSoon && (
              <span className="text-[10px] font-bold text-print-red uppercase tracking-tighter">
                Expires Soon
              </span>
            )}
          </div>
          <V3Pill tone={sub.status === "active" ? "green" : "ink"}>
            {sub.status}
          </V3Pill>
        </div>
        <div className="p-5 space-y-3">
          <CodeRow label="Auth" code={sub.auth_code} revealed={revealed} />
          <CodeRow label="Serv" code={sub.serv_code} revealed={revealed} />
          <V3Button variant="soft" fullWidth onClick={() => setRevealed((r) => !r)}>
            {revealed ? (
              <>
                <EyeOff className="h-4 w-4" /> Hide
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" /> Reveal
              </>
            )}
          </V3Button>
        </div>
      </V3Card>
    </motion.div>
  );
};

const CodeRow = ({ label, code, revealed }: { label: string; code: string; revealed: boolean }) => (
  <div className="flex items-stretch gap-2">
    <span className="w-14 flex items-center justify-center bg-ink/[0.06] text-ink/70 text-[11px] font-medium uppercase tracking-wider rounded-lg">
      {label}
    </span>
    <span
      className={cn(
        "flex-1 rounded-lg bg-ink/[0.03] border border-ink/12 px-3 py-2 font-mono text-sm tracking-wider text-ink",
        !revealed && "select-none text-ink/50",
      )}
    >
      {revealed ? maskCode(code) : "XX-XXXXXX"}
    </span>
  </div>
);

const SubCardSkeleton = () => (
  <V3Card className="p-0 overflow-hidden animate-pulse">
    <div className="px-5 py-4 flex items-center justify-between border-b border-ink/5 bg-ink/[0.03]">
      <div className="h-6 w-28 bg-ink/10 rounded-md" />
      <div className="h-6 w-16 bg-ink/10 rounded-full" />
    </div>
    <div className="p-5 space-y-3">
      <div className="flex items-stretch gap-2">
        <div className="w-14 h-9 bg-ink/10 rounded-lg" />
        <div className="flex-1 h-9 bg-ink/10 rounded-lg" />
      </div>
      <div className="flex items-stretch gap-2">
        <div className="w-14 h-9 bg-ink/10 rounded-lg" />
        <div className="flex-1 h-9 bg-ink/10 rounded-lg" />
      </div>
      <div className="h-10 w-full bg-ink/10 rounded-lg" />
    </div>
  </V3Card>
);

const V3Subs = () => {
  const {
    data: subs,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR("subscriptions", subsFetcher, {
    revalidateOnFocus: false,
    // shouldRetryOnError: false,
  });

  const active = subs?.filter((s) => s.status === "active") ?? [];
  const used = subs?.filter((s) => s.status === "used") ?? [];
  const expired = subs?.filter((s) => s.status === "expired") ?? [];
  const history = [...expired, ...used];

  const handleRefresh = () => {
    mutate();
  };

  if (error && !isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-10 md:py-14">
        <V3Card className="p-5 bg-print-red text-paper flex items-center justify-between">
          <p className="text-sm font-medium">Failed to load subscriptions</p>
          <V3Button
            variant="outline"
            onClick={handleRefresh}
            className="bg-paper text-ink hover:bg-paper/90"
          >
            Retry
          </V3Button>
        </V3Card>
      </div>
    );
  }

  return (
    <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-10 md:py-14">
        <div className="mb-8 flex items-baseline justify-between">
          <V3SectionHeader
            title="Subscriptions"
          />
          <V3Button
            variant="ghost"
            onClick={handleRefresh}
            disabled={isValidating}
            className="text-xs"
          >
            <RefreshCw className={cn("h-4 w-4", isValidating && "animate-spin")} />
            {isValidating ? "Refreshing..." : "Refresh"}
          </V3Button>
        </div>
        
        <div className="mb-8 flex flex-wrap gap-3">
          <V3Pill tone="green">{active.length} Active</V3Pill>
          <V3Pill tone="ink">{history.length} History</V3Pill>
        </div>

        {/* Expiry Policy Notice */}
        <V3Card className="mb-10 p-4 border-l-4 border-print-red bg-print-red/5 flex gap-4 items-start">
          <AlertCircle className="h-5 w-5 text-print-red shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-ink">Subscription Policy</h4>
            <p className="text-sm text-ink/70 leading-relaxed">
              Each code is valid for 1 year from the date of purchase.
              Codes not redeemed within that period will expire permanently and are not eligible for refunds.
            </p>
          </div>
        </V3Card>

        <Section title="Active Subscriptions">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <SubCardSkeleton key={i} />)
          ) : active.length > 0 ? (
            active.map((s) => <SubCard key={s._id} sub={s} />)
          ) : (
            <EmptyState text="You don't have any active subscriptions." />
          )}
        </Section>

        <Section title="History">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <SubCardSkeleton key={i} />)
          ) : history.length > 0 ? (
            history.map((s) => <SubCard key={s._id} sub={s} />)
          ) : (
            <EmptyState text="No subscription history yet." />
          )}
        </Section>
      </div>
    </motion.div>
  );
};

const Section = ({
  title,
  right,
  children,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <section className="mb-12">
    <header className="flex items-center justify-between mb-5">
      <h2 className="font-v3-display text-2xl">{title}</h2>
      {right}
    </header>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">{children}</div>
  </section>
);

const EmptyState = ({ text }: { text: string }) => (
  <div className="col-span-full text-xs uppercase tracking-widest text-ink/40 py-8 text-center">
    {text}
  </div>
);

export default V3Subs;
