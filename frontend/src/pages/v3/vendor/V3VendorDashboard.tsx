import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Eye, EyeOff, ScanLine, X } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { V3Card, V3Button, V3Pill } from "@/components/v3/V3UI";
import { Skeleton } from "@/components/ui/skeleton";
import { vendorBusinessApi, userApi, type VendorServiceCode } from "@/lib/api/";
import { SettingsModal } from "@/components/app/SettingsModal";

const formatNaira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

const maskCode = (code: string) => {
  if (!code) return "";
  if (code.length <= 4) return "•".repeat(code.length);
  return `${code.slice(0, 2)}${"•".repeat(code.length - 4)}${code.slice(-2)}`;
};

const VoucherRow = ({ item }: { item: VendorServiceCode }) => {
  const [revealed, setRevealed] = useState(false);
  const auth = revealed ? maskCode(item.auth_code) : "•".repeat(item.auth_code.length);
  const serv = revealed ? maskCode(item.serv_code) : "•".repeat(item.serv_code.length);

  return (
    <motion.div whileHover={{ y: -3 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
      <V3Card className="p-5 relative">
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-ink text-paper px-2.5 py-0.5 text-[10px] font-medium">
          Booked
        </span>
        <p className="text-[11px] uppercase tracking-wider text-ink/55">
          {new Date(item.issuedAt).toLocaleDateString()}
        </p>
        <h3 className="font-v3-display text-lg mt-1">{item.serviceId?.name ?? "Service"}</h3>
        <p className="text-xs text-ink/65 mt-0.5">For: {item.userId?.email ?? "—"}</p>

        <div className="mt-4 space-y-2">
          {[
            { l: "Auth", v: auth },
            { l: "Serv", v: serv },
          ].map((r) => (
            <div key={r.l} className="flex items-stretch gap-2">
              <span className="w-16 flex items-center justify-center bg-ink/[0.06] text-ink/70 text-[10px] font-medium uppercase rounded-lg">
                {r.l}
              </span>
              <span className="flex-1 rounded-lg bg-ink/[0.03] border border-ink/12 px-3 py-1.5 font-mono text-xs tracking-widest text-ink/80">
                {r.v}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <V3Button variant="soft" size="sm" className="flex-1" onClick={() => setRevealed((v) => !v)}>
            {revealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {revealed ? "Hide" : "Reveal"}
          </V3Button>
        </div>
      </V3Card>
    </motion.div>
  );
};

const VoucherSkeleton = () => (
  <V3Card className="p-5 relative">
    <Skeleton className="absolute top-3 right-3 h-5 w-16 rounded-full" />
    <Skeleton className="h-3 w-24 rounded" />
    <Skeleton className="mt-2 h-5 w-40 rounded" />
    <Skeleton className="mt-1 h-3 w-32 rounded" />
    <div className="mt-4 space-y-2">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="flex items-stretch gap-2">
          <Skeleton className="w-16 h-8 rounded-lg" />
          <Skeleton className="flex-1 h-8 rounded-lg" />
        </div>
      ))}
    </div>
    <Skeleton className="mt-4 h-8 w-full rounded-lg" />
  </V3Card>
);

const V3VendorDashboard = () => {
  const queryClient = useQueryClient();

  const { data: me, isLoading: loadingMe } = useQuery({
    queryKey: ["vendor", "me"],
    queryFn: async () => (await vendorBusinessApi.getVendorMe()).data,
  });

  const { data: profileData, isLoading: loadingProfile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await userApi.getProfile()).data,
  });

  const { data: earnings, isLoading: loadingEarnings } = useQuery({
    queryKey: ["vendor", "earnings"],
    queryFn: async () => (await vendorBusinessApi.getVendorEarnings()).data,
  });

  const displayName = profileData?.name || me?.vendor?.businessName || "Vendor";
  const headerLoading = loadingMe || loadingProfile;

  const activeCodes = useMemo(
    () => (me?.serviceCodes ?? []).filter((c) => c.status === "active"),
    [me]
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
      setFeedback({ kind: "ok", msg: `Redeemed: ${res.data.serviceId?.name ?? "service"}` });
      setServCode("");
      setAuthCode("");
      toast.success("Code redeemed");
      await queryClient.invalidateQueries({ queryKey: ["vendor", "me"] });
      await queryClient.invalidateQueries({ queryKey: ["vendor", "earnings"] });
      setTimeout(() => { setRedeemOpen(false); setFeedback(null); }, 900);
    } catch (e: any) {
      setFeedback({ kind: "err", msg: e?.message ?? "Redemption failed" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-5 md:px-8 py-10 md:py-14">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 mb-8">
        <div>
          <V3Pill tone="red" className="mb-3">Provider</V3Pill>
          {headerLoading ? (
            <Skeleton className="h-12 md:h-16 w-72 rounded-xl" />
          ) : (
            <h1 className="font-v3-display text-4xl md:text-6xl tracking-tight leading-[1.02]">
              {displayName}
            </h1>
          )}
        </div>
        {loadingMe ? (
          <Skeleton className="h-4 w-32 rounded" />
        ) : (
          <p className="text-sm text-ink/55">{activeCodes.length} booked services</p>
        )}
      </div>

      <section className="grid md:grid-cols-3 gap-5 mb-12">
        <button
          onClick={() => { setRedeemOpen(true); setFeedback(null); }}
          className="md:col-span-2 group text-left"
        >
          <div className="relative overflow-hidden rounded-[20px] p-7 h-full text-paper bg-gradient-to-br from-print-red to-print-orange flex flex-col justify-between gap-6 transition-transform group-hover:-translate-y-1 shadow-[0_18px_40px_-18px_hsl(var(--print-red)/0.55)]">
            <div className="flex items-start justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-paper/15 backdrop-blur border border-paper/25 px-2.5 py-1 text-[11px] font-medium">
                Primary action
              </span>
              <ScanLine className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-v3-display text-3xl md:text-4xl tracking-tight">Redeem a code</h2>
              <p className="mt-2 text-sm text-paper/85">
                Paste or type the customer's code → confirm in seconds
              </p>
            </div>
            <span className="self-start inline-flex items-center gap-2 rounded-full border border-paper/30 bg-paper/10 px-4 py-2 text-xs font-medium">
              Open redeem panel <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </button>

        <V3Card className="flex flex-col justify-between">
          <div>
            <V3Pill tone="green">Earnings</V3Pill>
            {loadingEarnings ? (
              <div className="mt-5 space-y-3">
                <div className="flex items-baseline justify-between border-b border-dashed border-ink/15 pb-2">
                  <Skeleton className="h-3 w-28 rounded" />
                  <Skeleton className="h-6 w-24 rounded" />
                </div>
                <div className="flex items-baseline justify-between">
                  <Skeleton className="h-3 w-24 rounded" />
                  <Skeleton className="h-6 w-12 rounded" />
                </div>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                <div className="flex items-baseline justify-between border-b border-dashed border-ink/15 pb-2">
                  <span className="text-xs text-ink/65">Gross redeemed</span>
                  <span className="font-v3-display text-xl text-print-green">
                    {formatNaira(earnings?.totals.grossNaira ?? 0)}
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-ink/65">Active codes</span>
                  <span className="font-v3-display text-xl text-print-orange">
                    {earnings?.totals.codesActive ?? 0}
                  </span>
                </div>
              </div>
            )}
          </div>
          <Link to="/v3/vendor/earnings" className="mt-5 text-xs text-print-red hover:underline underline-offset-4 self-start">
            View details →
          </Link>
        </V3Card>
      </section>

      <section className="space-y-12">
        {loadingMe ? (
          <div>
            <div className="mb-5 flex items-end justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-8 w-56 rounded-xl" />
              </div>
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 3 }).map((_, i) => <VoucherSkeleton key={i} />)}
            </div>
          </div>
        ) : grouped.length === 0 ? (
          <V3Card className="px-6 py-16 text-center border-dashed">
            <p className="font-v3-display text-2xl">No outstanding bookings.</p>
            <p className="mt-2 text-xs text-ink/55">
              Redeemed services disappear from the ledger.
            </p>
          </V3Card>
        ) : (
          grouped.map(([customer, items]) => (
            <div key={customer}>
              <div className="mb-5 flex items-end justify-between">
                <div>
                  <V3Pill tone="red" className="mb-2">Customer</V3Pill>
                  <h2 className="font-v3-display text-2xl md:text-3xl tracking-tight">{customer}</h2>
                </div>
                <V3Pill tone="ink">
                  {items.length} {items.length === 1 ? "booking" : "bookings"}
                </V3Pill>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {items.map((item) => (
                  <VoucherRow key={item._id} item={item} />
                ))}
              </div>
            </div>
          ))
        )}
      </section>

      <AnimatePresence>
        {redeemOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm p-5"
            onClick={() => setRedeemOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.94, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 16 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <V3Card className="p-6">
                <button
                  onClick={() => setRedeemOpen(false)}
                  className="absolute right-3 top-3 h-8 w-8 rounded-full bg-ink/[0.06] flex items-center justify-center hover:bg-ink hover:text-paper transition-colors"
                  aria-label="Close"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <V3Pill tone="red" className="mb-2">Redeem</V3Pill>
                <h3 className="font-v3-display text-2xl mt-2">Enter customer code</h3>
                <p className="mt-2 text-xs text-ink/55">Single-use · both codes required · locked to this provider</p>

                <div className="mt-6 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-ink/50 ml-1">Service code</label>
                    <input
                      autoFocus
                      value={servCode}
                      onChange={(e) => setServCode(e.target.value.toUpperCase())}
                      placeholder="ABCD1234"
                      className="w-full rounded-xl border border-ink/12 bg-ink/[0.02] px-4 py-3 font-mono text-sm tracking-widest placeholder:text-ink/20 focus:outline-none focus:ring-2 focus:ring-print-red/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-ink/50 ml-1">Auth code</label>
                    <input
                      value={authCode}
                      onChange={(e) => setAuthCode(e.target.value.toUpperCase())}
                      placeholder="123456"
                      className="w-full rounded-xl border border-ink/12 bg-ink/[0.02] px-4 py-3 font-mono text-sm tracking-widest placeholder:text-ink/20 focus:outline-none focus:ring-2 focus:ring-print-red/20"
                    />
                  </div>

                  {feedback && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`rounded-xl p-3 text-[11px] font-medium ${
                        feedback.kind === "ok" ? "bg-print-green/10 text-print-green" : "bg-print-red/10 text-print-red"
                      }`}
                    >
                      {feedback.msg}
                    </motion.div>
                  )}

                  <V3Button fullWidth isLoading={submitting} onClick={handleRedeem}>
                    Confirm redemption
                  </V3Button>
                </div>
              </V3Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </main>
  );
};

export default V3VendorDashboard;
