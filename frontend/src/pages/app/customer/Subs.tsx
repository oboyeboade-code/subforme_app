import { useState } from "react";
import useSWR from "swr";
import { cn } from "@/lib/utils";
import { serviceApi, type ServiceCode } from "@/lib/api/";
import { AlertCircle } from "lucide-react";
import { ConfirmNavLink } from "@/components/app/ConfirmNavLink";

const subsFetcher = async (): Promise<ServiceCode[]> => 
  serviceApi.getSubscriptions().then(res => res.data.subscriptions)

const maskCode = (c: string) => {
  if (!c) return "";
  // We only show the first 2 letters and the rest as "XXXXXX" 
  // to give the illusion of security without fetching real codes
  return `${c.slice(0, 2)}-XXXXXX`;
};

const SubCard = ({ sub }: { sub: any }) => {
  const [revealed, setRevealed] = useState(false);
  
  const isExpiringSoon = sub.status === "active" && sub.expiresAt && 
    (new Date(sub.expiresAt).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000);

  return (
    <article className="border-2 border-ink bg-card flex flex-col">
      <div className="border-b-2 border-ink px-4 py-3 flex items-baseline justify-between">
        <div className="flex flex-col">
          <h3 className="font-editorial text-xl text-ink">
            <ConfirmNavLink
              to={`/app/readmore/${sub.serviceId}`}
              confirmTitle="Leave to Bookings Page?"
              confirmDescription="You want to book this service one more time ?"
            >
              <span className="text-sm text-print-red hover:underline">{sub.serviceName}</span>
            </ConfirmNavLink>
          </h3>
          {isExpiringSoon && (
            <span className="font-mono-display text-[9px] font-bold text-print-red uppercase tracking-tighter">
              Expires Soon
            </span>
          )}
        </div>
        <span
          className={cn(
            "font-mono-display text-[10px] uppercase tracking-widest px-2 py-0.5 border-2 border-ink",
            sub.status === "active" && "bg-print-green text-secondary-foreground",
            sub.status === "used" && "bg-print-orange text-accent-foreground",
            sub.status === "expired" && "bg-muted text-muted-foreground",
          )}
        >
          {sub.status}
        </span>
      </div>
      <div className="p-4 space-y-2">
        <CodeRow label="Auth" code={sub.auth_code} revealed={revealed} />
        <CodeRow label="Serv" code={sub.serv_code} revealed={revealed} />
        <button
          onClick={() => setRevealed((r) => !r)}
          className="w-full mt-2 border-2 border-ink bg-print-orange text-accent-foreground font-mono-display text-xs uppercase tracking-wider py-2 hover:bg-print-orange/90 transition-colors"
        >
          {revealed ? "Hide" : "Reveal"}
        </button>
      </div>
    </article>
  );
};

const CodeRow = ({ label, code, revealed }: { label: string; code: string; revealed: boolean }) => (
  <div className="flex items-center gap-2">
    <span className="font-mono-display text-[10px] uppercase tracking-widest text-muted-foreground w-10">
      {label}
    </span>
    <span
      className={cn(
        "flex-1 bg-paper-deep border-2 border-ink px-3 py-1.5 font-mono-display text-sm tracking-wider text-ink",
        !revealed && "select-none",
      )}
    >
      {revealed ? maskCode(code) : "XX-XXXXXX"}
    </span>
  </div>
);

const SubCardSkeleton = () => (
  <article className="border-2 border-ink bg-card flex flex-col animate-pulse">
    <div className="border-b-2 border-ink px-4 py-3 flex items-baseline justify-between">
      <div className="h-6 w-24 bg-muted" />
      <div className="h-5 w-14 bg-muted" />
    </div>
    <div className="p-4 space-y-2">
      <div className="flex items-center gap-2">
        <div className="h-3 w-10 bg-muted" />
        <div className="flex-1 h-8 bg-muted" />
      </div>
      <div className="flex items-center gap-2">
        <div className="h-3 w-10 bg-muted" />
        <div className="flex-1 h-8 bg-muted" />
      </div>
      <div className="mt-2 h-9 w-full bg-muted" />
    </div>
  </article>
);

const Subs = () => {
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
  const history = subs?.filter((s) => s.status === "used" || s.status === "expired") ?? [];

  const handleRefresh = () => {
    mutate();
  };

  if (error && !isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10">
        <EmptyState
          text="Failed to load subscriptions."
          action={
            <button
              onClick={handleRefresh}
              className="border-2 border-ink px-3 py-1"
            >
              Retry
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <header className="mb-8 pb-3 border-b-2 border-ink flex items-baseline justify-between">
        <h1 className="font-editorial text-3xl text-ink">Subscriptions</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={handleRefresh}
            disabled={isValidating}
            className={cn(
              "font-mono-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground border-2 border-ink px-3 py-1",
              "hover:bg-ink hover:text-paper transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isValidating ? "Refreshing..." : "Refresh"}
          </button>
          <span className="font-mono-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Section · D
          </span>
        </div>
      </header>

      {/* Expiry Policy Notice */}
      <div className="mb-10 p-4 border-2 border-ink bg-print-red/5 flex gap-4 items-start">
        <AlertCircle className="h-5 w-5 text-print-red shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-mono-display text-xs font-bold text-ink uppercase tracking-wider">Subscription Policy</h4>
          <p className="font-mono-display text-[11px] text-ink/70 leading-relaxed uppercase tracking-tight">
            Each code is valid for 1 year from the date of purchase.
            Codes not redeemed within that period will expire permanently and are not eligible for refunds.
          </p>
        </div>
      </div>

      <Section title="Active Subs">
          {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <SubCardSkeleton key={i} />
          ))
        ) : active.length > 0 ? (
          active.map((s) => (
            <SubCard key={s._id} sub={s} />
          ))
        ) : (
          <EmptyState text="No active subscriptions." />
        )}
      </Section>

      <Section title="History">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <SubCardSkeleton key={i} />
          ))
        ) : history.length > 0 ? (
          history.map((s) => (
            <SubCard key={s._id} sub={s} />
          ))
        ) : (
          <EmptyState text="No subscription history yet." />
        )}
      </Section>

    </div>
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
  <section className="mb-10">
    <header className="flex items-baseline justify-between mb-4 pb-2 border-b-2 border-ink">
      <h2 className="font-editorial text-2xl text-ink">{title}</h2>
      {right}
    </header>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {children}
    </div>
  </section>
);

const EmptyState = ({
  text,
  action,
}: {
  text: string;
  action?: React.ReactNode;
}) => (
  <div className="col-span-full flex flex-col items-center gap-3 font-mono-display text-xs uppercase tracking-widest text-muted-foreground">
    <p>{text}</p>
    {action}
  </div>
);

export default Subs;
