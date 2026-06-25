import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Download, Receipt } from "lucide-react";
import { V3Card, V3Pill, V3Button } from "@/components/v3/V3UI";
import { Skeleton } from "@/components/ui/skeleton";
import { SettingsModal } from "@/components/app/SettingsModal";
import { toast } from "sonner";
import { vendorBusinessApi, userApi } from "@/lib/api/";

const formatNaira = (n: number) => `${n < 0 ? "−" : ""}₦${Math.abs(n).toLocaleString("en-NG")}`;

const V3VendorEarnings = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);

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

  const rows = useMemo(() => earnings?.perService ?? [], [earnings]);
  const totals = earnings?.totals ?? { grossNaira: 0, codesIssued: 0, codesUsed: 0, codesActive: 0 };

  const displayName = profileData?.name || me?.vendor?.businessName || "Vendor";
  const headerLoading = loadingMe || loadingProfile;

  const exportCsv = () => {
    const header = "service,price,codesIssued,codesUsed,codesActive,gross\n";
    const body = rows
      .map((r) => `"${r.name}",${r.priceNaira},${r.codesIssued},${r.codesUsed},${r.codesActive},${r.grossNaira}`)
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vendor-earnings.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export downloaded");
  };

  const requestCashout = () => {
    window.location.href = "mailto:providers@subforme.app?subject=Cashout%20request";
  };

  return (
    <main className="max-w-7xl mx-auto px-5 md:px-8 py-10 md:py-14">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 mb-8"
      >
        <div>
          {headerLoading ? (
            <Skeleton className="mb-3 h-5 w-32 rounded-full" />
          ) : (
            <V3Pill tone="green" className="mb-3">{displayName}</V3Pill>
          )}
          <h1 className="font-v3-display text-4xl md:text-6xl tracking-tight leading-[1.02]">
            Payout ledger
          </h1>
          <p className="mt-2 text-sm text-ink/55">Settles every Friday · 8% platform fee</p>
        </div>
      </motion.div>

      {/* Totals */}
      <section className="grid md:grid-cols-3 gap-5 mb-12">
        {loadingEarnings ? (
          Array.from({ length: 3 }).map((_, i) => (
            <V3Card key={i}>
              <Skeleton className="h-3 w-24 rounded" />
              <Skeleton className="mt-3 h-9 w-32 rounded" />
              <Skeleton className="mt-5 h-7 w-28 rounded-full" />
            </V3Card>
          ))
        ) : (
          <>
            <V3Card>
              <p className="text-[11px] uppercase tracking-wider text-ink/55">Gross redeemed</p>
              <p className="font-v3-display text-3xl text-print-green mt-2">{formatNaira(totals.grossNaira)}</p>
              <V3Button size="sm" className="mt-4" onClick={requestCashout}>
                <Receipt className="h-3.5 w-3.5" /> Request cashout
              </V3Button>
            </V3Card>
            <V3Card>
              <p className="text-[11px] uppercase tracking-wider text-ink/55">Codes issued</p>
              <p className="font-v3-display text-3xl mt-2">{totals.codesIssued}</p>
              <p className="mt-4 text-xs text-ink/55">{totals.codesActive} active</p>
            </V3Card>
            <V3Card>
              <p className="text-[11px] uppercase tracking-wider text-ink/55">Codes used</p>
              <p className="font-v3-display text-3xl text-print-orange mt-2">{totals.codesUsed}</p>
              <p className="mt-4 text-xs text-ink/55">Lifetime redemptions</p>
            </V3Card>
          </>
        )}
      </section>

      <section>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <V3Pill tone="red" className="mb-2">Per service</V3Pill>
            <h2 className="font-v3-display text-2xl md:text-3xl tracking-tight">
              Earnings breakdown
            </h2>
          </div>
          <button
            onClick={exportCsv}
            disabled={loadingEarnings}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border border-ink/12 bg-paper/70 text-xs font-medium hover:bg-paper disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" /> CSV
          </button>
        </div>

        {loadingEarnings ? (
          <V3Card className="p-0 overflow-hidden">
            <ul className="divide-y divide-ink/8">
              {Array.from({ length: 5 }).map((_, i) => (
                <li key={i} className="grid grid-cols-12 items-center gap-3 px-4 py-3.5 md:px-6">
                  <div className="col-span-12 md:col-span-5 space-y-2">
                    <Skeleton className="h-4 w-40 rounded" />
                    <Skeleton className="h-3 w-28 rounded" />
                  </div>
                  <Skeleton className="col-span-4 md:col-span-2 h-3 w-16 rounded" />
                  <Skeleton className="col-span-4 md:col-span-2 h-3 w-14 rounded" />
                  <Skeleton className="col-span-4 md:col-span-3 h-5 w-24 rounded justify-self-end" />
                </li>
              ))}
            </ul>
          </V3Card>
        ) : rows.length === 0 ? (
          <V3Card className="px-6 py-16 text-center border-dashed">
            <p className="font-v3-display text-2xl">No earnings yet.</p>
          </V3Card>
        ) : (
          <V3Card className="p-0 overflow-hidden">
            <ul className="divide-y divide-ink/8">
              {rows.map((r) => (
                <li key={r.serviceId} className="grid grid-cols-12 items-center gap-3 px-4 py-3.5 md:px-6 hover:bg-ink/[0.02] transition-colors">
                  <div className="col-span-12 md:col-span-5 min-w-0">
                    <p className="text-sm text-ink truncate">{r.name}</p>
                    <p className="text-[11px] text-ink/45 mt-0.5">{formatNaira(r.priceNaira)} per redemption</p>
                  </div>
                  <span className="col-span-4 md:col-span-2 text-[11px] text-ink/55">{r.codesIssued} issued</span>
                  <span className="col-span-4 md:col-span-2 text-[11px] text-print-green">{r.codesUsed} used</span>
                  <span className="col-span-4 md:col-span-3 font-v3-display text-right text-lg text-print-green">
                    {formatNaira(r.grossNaira)}
                  </span>
                </li>
              ))}
            </ul>
          </V3Card>
        )}
      </section>
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </main>
  );
};

export default V3VendorEarnings;
