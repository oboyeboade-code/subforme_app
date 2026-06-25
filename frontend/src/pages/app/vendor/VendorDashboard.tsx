import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowUpRight,
  Eye,
  EyeOff,
  ScanLine,
  X,
} from "lucide-react";
import { vendorBusinessApi, userApi, type VendorServiceCode } from "@/lib/api/";
import { SettingsModal } from "@/components/app/SettingsModal";
import {
  VendorCardsSkeleton,
  VendorSkeleton,
  VendorEmptyState,
} from "@/components/app/VendorStates";
import { toast } from "sonner";

const formatNaira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

const CodeCard = ({ item }: { item: VendorServiceCode }) => {
  const [revealed, setRevealed] = useState(false);
  const auth = revealed ? item.auth_code : "•".repeat(item.auth_code.length);
  const serv = revealed ? item.serv_code : "•".repeat(item.serv_code.length);
  const serviceName = item.serviceId?.name ?? "Service";
  const customer = item.userId?.email ?? "Customer";

  return (
    <article className="group relative border-2 border-ink bg-card p-4 shadow-[4px_4px_0_0_hsl(var(--ink))] transition-transform hover:-translate-y-0.5">
      <span className="absolute -right-px -top-px bg-ink px-2 py-0.5 font-mono-display text-[10px] uppercase tracking-[0.2em] text-paper">
        Booked
      </span>

      <p className="font-mono-display text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        {new Date(item.issuedAt).toLocaleDateString()}
      </p>
      <h3 className="font-editorial mt-1 text-xl font-semibold leading-tight">{serviceName}</h3>
      <p className="font-mono-display mt-1 text-xs text-ink/70">For: {customer}</p>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between border border-ink/30 bg-paper-deep px-2.5 py-1.5">
          <span className="font-mono-display text-[10px] uppercase tracking-wider text-ink/60">
            Auth
          </span>
          <span className="font-mono-display text-sm tracking-widest">{auth}</span>
        </div>
        <div className="flex items-center justify-between border border-ink/30 bg-paper-deep px-2.5 py-1.5">
          <span className="font-mono-display text-[10px] uppercase tracking-wider text-ink/60">
            Serv
          </span>
          <span className="font-mono-display text-sm tracking-widest">{serv}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          onClick={() => setRevealed((v) => !v)}
          className="inline-flex items-center gap-1.5 border border-ink px-2.5 py-1.5 font-mono-display text-[11px] uppercase tracking-wider transition-colors hover:bg-ink hover:text-paper"
          aria-pressed={revealed}
        >
          {revealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {revealed ? "Hide" : "Reveal"}
        </button>
      </div>
    </article>
  );
};

const VendorDashboard = () => {
  const queryClient = useQueryClient();

  // 1. Original Vendor Data (for business logic/earnings)
  const { data: me, isLoading: meLoading } = useQuery({
    queryKey: ["vendor", "me"],
    queryFn: async () => (await vendorBusinessApi.getVendorMe()).data,
  });

  // 2. New Profile Data (for identity/display name)
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await userApi.getProfile()).data,
  });

  const { data: earnings, isLoading: earningsLoading } = useQuery({
    queryKey: ["vendor", "earnings"],
    queryFn: async () => (await vendorBusinessApi.getVendorEarnings()).data,
  });

  const isLoading = meLoading || profileLoading || earningsLoading;

  // Display name priorities: 
  // 1. Profile Identity Name
  // 2. Vendor Business Name
  // 3. Fallback
  const displayName = profileData?.name || me?.vendor?.businessName || "Vendor";

  const activeCodes = useMemo(
    () => (me?.serviceCodes ?? []).filter((c) => c.status === "active"),
    [me],
  );

  const [redeemOpen, setRedeemOpen] = useState(false);
  const [servCode, setServCode] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [feedback, setFeedback] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const grouped = useMemo(() => {
    const map = new Map<string, VendorServiceCode[]>();
    activeCodes.forEach((b) => {
      const key = b.userId?.email ?? "Unknown";
      const arr = map.get(key) ?? [];
      arr.push(b);
      map.set(key, arr);
    });
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [activeCodes]);

  const handleRedeem = async () => {
    if (!servCode.trim() || !authCode.trim()) {
      setFeedback({ kind: "err", msg: "Both service code and auth code are required." });
      return;
    }
    setSubmitting(true);
    try {
      const res = await vendorBusinessApi.redeemServiceCode(servCode, authCode);
      setFeedback({
        kind: "ok",
        msg: `Redeemed: ${res.data.serviceId?.name ?? "service"}`,
      });
      setServCode("");
      setAuthCode("");
      toast.success("Code redeemed");
      await queryClient.invalidateQueries({ queryKey: ["vendor", "me"] });
      await queryClient.invalidateQueries({ queryKey: ["vendor", "earnings"] });
      setTimeout(() => {
        setRedeemOpen(false);
        setFeedback(null);
      }, 900);
    } catch (e: any) {
      setFeedback({ kind: "err", msg: e?.message ?? "Redemption failed" });
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-10 md:py-14 space-y-10">
        <div className="border-b-2 border-ink pb-6 space-y-3">
          <VendorSkeleton className="h-3 w-24" />
          <VendorSkeleton className="h-14 md:h-20 w-2/3" />
        </div>
        <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <VendorSkeleton className="md:col-span-2 h-44" />
          <VendorSkeleton className="h-44" />
        </section>
        <VendorCardsSkeleton count={3} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 md:px-10 md:py-14">
      <div className="flex flex-col gap-2 border-b-2 border-ink pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono-display text-[11px] uppercase tracking-[0.25em] text-print-red">
            ▍ Provider
          </p>
          <h1 className="font-editorial mt-1 text-5xl font-semibold leading-none tracking-tight md:text-7xl">
            {displayName}
          </h1>
        </div>
        <p className="font-mono-display text-xs uppercase tracking-[0.2em] text-ink/60">
          {activeCodes.length} booked services · awaiting redemption
        </p>
      </div>

      <section className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
        <button
          onClick={() => {
            setRedeemOpen(true);
            setFeedback(null);
          }}
          className="group flex flex-col items-start justify-between gap-6 border-2 border-ink bg-print-red p-6 text-left text-paper shadow-[6px_6px_0_0_hsl(var(--ink))] transition-transform hover:-translate-y-0.5 md:col-span-2"
        >
          <div className="flex w-full items-start justify-between">
            <span className="font-mono-display text-[11px] uppercase tracking-[0.3em] text-paper/80">
              Primary action
            </span>
            <ScanLine className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-editorial text-4xl font-semibold leading-none md:text-5xl">
              Redeem a code
            </h2>
            <p className="font-mono-display mt-3 max-w-md text-xs uppercase tracking-[0.2em] text-paper/80">
              Paste or type the customer's code → confirm in seconds.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 border border-paper/60 px-3 py-1.5 font-mono-display text-[11px] uppercase tracking-[0.25em] transition-colors group-hover:bg-paper group-hover:text-ink">
            Open redeem panel <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </button>

        <aside className="flex flex-col justify-between border-2 border-ink bg-card p-5 shadow-[4px_4px_0_0_hsl(var(--ink))]">
          <div>
            <p className="font-mono-display text-[11px] uppercase tracking-[0.3em] text-print-red">
              Earnings
            </p>
            <div className="mt-4 space-y-3 font-mono-display text-sm">
              <div className="flex items-baseline justify-between border-b border-dashed border-ink/40 pb-2">
                <span className="text-ink/70">Gross redeemed</span>
                <span className="text-print-green text-lg font-semibold">
                  {formatNaira(earnings?.totals.grossNaira ?? 0)}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-ink/70">Active codes</span>
                <span className="text-print-orange text-lg font-semibold">
                  {earnings?.totals.codesActive ?? 0}
                </span>
              </div>
            </div>
          </div>
          <Link
            to="/vendor/earnings"
            className="mt-5 inline-flex items-center gap-1 font-mono-display text-[11px] uppercase tracking-[0.25em] text-print-red underline-offset-4 hover:underline self-start"
          >
            View details <ArrowUpRight className="h-3 w-3" />
          </Link>
        </aside>
      </section>

      <section className="mt-14 space-y-12">
        {grouped.length === 0 ? (
          <VendorEmptyState
            title="No outstanding bookings."
            hint="Redeemed services disappear from the ledger."
          />
        ) : (
          grouped.map(([customer, items]) => (
            <div key={customer}>
              <div className="mb-5 flex items-end justify-between border-b-2 border-ink pb-2">
                <div>
                  <p className="font-mono-display text-[11px] uppercase tracking-[0.25em] text-print-red">
                    ▍ Customer
                  </p>
                  <h2 className="font-editorial text-2xl font-semibold tracking-tight md:text-3xl">
                    {customer}
                  </h2>
                </div>
                <span className="font-mono-display text-[11px] uppercase tracking-[0.25em] text-ink/60">
                  {items.length} {items.length === 1 ? "booking" : "bookings"}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <CodeCard key={item._id} item={item} />
                ))}
              </div>
            </div>
          ))
        )}
      </section>

      {redeemOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-5"
          onClick={() => setRedeemOpen(false)}
        >
          <div
            className="relative w-full max-w-md border-2 border-ink bg-paper p-6 shadow-[8px_8px_0_0_hsl(var(--ink))]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setRedeemOpen(false)}
              className="absolute right-3 top-3 border border-ink p-1 hover:bg-ink hover:text-paper"
              aria-label="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <p className="font-mono-display text-[11px] uppercase tracking-[0.3em] text-print-red">
              ▍ Redeem
            </p>
            <h3 className="font-editorial mt-2 text-3xl font-semibold leading-tight">
              Enter customer code
            </h3>
            <p className="font-mono-display mt-2 text-xs text-ink/70">
              Single-use · both codes required · locked to this provider
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="serv-code"
                  className="font-mono-display text-[11px] uppercase tracking-[0.25em] text-ink/70"
                >
                  Service code
                </label>
                <input
                  id="serv-code"
                  autoFocus
                  value={servCode}
                  onChange={(e) => setServCode(e.target.value.toUpperCase())}
                  placeholder="ABCD1234"
                  className="mt-1 w-full border-2 border-ink bg-paper px-3 py-3 font-mono-display text-base tracking-widest placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-print-red"
                />
              </div>
              <div>
                <label
                  htmlFor="auth-code"
                  className="font-mono-display text-[11px] uppercase tracking-[0.25em] text-ink/70"
                >
                  Auth code
                </label>
                <input
                  id="auth-code"
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value.toUpperCase())}
                  placeholder="123456"
                  className="mt-1 w-full border-2 border-ink bg-paper px-3 py-3 font-mono-display text-base tracking-widest placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-print-red"
                />
              </div>

              {feedback && (
                <div
                  className={`border-2 p-3 font-mono-display text-[11px] uppercase tracking-wider ${
                    feedback.kind === "ok"
                      ? "border-print-green bg-print-green/10 text-print-green"
                      : "border-print-red bg-print-red/10 text-print-red"
                  }`}
                >
                  {feedback.msg}
                </div>
              )}

              <button
                disabled={submitting}
                onClick={handleRedeem}
                className="w-full bg-ink py-4 font-mono-display text-xs uppercase tracking-[0.3em] text-paper transition-transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                {submitting ? "Processing…" : "Confirm redemption"}
              </button>
            </div>
          </div>
        </div>
      )}

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
};

export default VendorDashboard;
