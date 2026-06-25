import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { SettingsModal } from "@/components/app/SettingsModal";
import { toast } from "sonner";
import { vendorBusinessApi, userApi } from "@/lib/api/";
import {
  VendorSkeleton,
  VendorTotalsSkeleton,
  VendorRowsSkeleton,
  VendorEmptyState,
} from "@/components/app/VendorStates";

const formatNaira = (n: number) => `${n < 0 ? "-" : ""}₦${Math.abs(n).toLocaleString("en-NG")}`;

const VendorEarnings = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Added me query for business name fallback
  const { data: me, isLoading: meLoading } = useQuery({
    queryKey: ["vendor", "me"],
    queryFn: async () => (await vendorBusinessApi.getVendorMe()).data,
  });

  // Added profile query for identity/display name
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await userApi.getProfile()).data,
  });

  const { data: earnings, isLoading: earningsLoading } = useQuery({
    queryKey: ["vendor", "earnings"],
    queryFn: async () => (await vendorBusinessApi.getVendorEarnings()).data,
  });

  const isLoading = meLoading || profileLoading || earningsLoading;

  const rows = useMemo(() => earnings?.perService ?? [], [earnings]);
  const totals = earnings?.totals ?? { grossNaira: 0, codesIssued: 0, codesUsed: 0, codesActive: 0 };

  // Consistent display name logic
  const displayName = profileData?.name || me?.vendor?.businessName || "Vendor";

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

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-10 md:py-14 space-y-10">
        <div className="border-b-2 border-ink pb-6 space-y-3">
          <VendorSkeleton className="h-3 w-32" />
          <VendorSkeleton className="h-14 md:h-20 w-2/3" />
        </div>
        <VendorTotalsSkeleton />
        <div className="space-y-4">
          <VendorSkeleton className="h-8 w-64" />
          <VendorRowsSkeleton count={5} />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 md:px-10 md:py-14">
      <div className="flex flex-col gap-2 border-b-2 border-ink pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono-display text-[11px] uppercase tracking-[0.25em] text-print-red">▍ {displayName}</p>
          <h1 className="font-editorial mt-1 text-5xl font-semibold leading-none tracking-tight md:text-7xl">
            Payout ledger
          </h1>
        </div>
        <p className="font-mono-display text-xs uppercase tracking-[0.2em] text-ink/60">
          Settles every Friday · 8% platform fee
        </p>
      </div>

      <section className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
        <article className="border-2 border-ink bg-card p-5 shadow-[4px_4px_0_0_hsl(var(--ink))]">
          <p className="font-mono-display text-[10px] uppercase tracking-[0.3em] text-ink/60">Gross redeemed</p>
          <p className="font-editorial mt-3 text-4xl text-print-green">{formatNaira(totals.grossNaira)}</p>
          <button
            onClick={requestCashout}
            className="mt-4 inline-flex items-center gap-1.5 bg-print-green px-3 py-1.5 font-mono-display text-[11px] font-semibold uppercase tracking-wider text-paper transition-transform hover:-translate-y-0.5"
          >
            Request cashout
          </button>
        </article>
        <article className="border-2 border-ink bg-card p-5 shadow-[4px_4px_0_0_hsl(var(--ink))]">
          <p className="font-mono-display text-[10px] uppercase tracking-[0.3em] text-ink/60">Codes issued</p>
          <p className="font-editorial mt-3 text-4xl">{totals.codesIssued}</p>
          <p className="mt-4 font-mono-display text-[11px] uppercase tracking-wider text-ink/60">
            {totals.codesActive} active
          </p>
        </article>
        <article className="border-2 border-ink bg-card p-5 shadow-[4px_4px_0_0_hsl(var(--ink))]">
          <p className="font-mono-display text-[10px] uppercase tracking-[0.3em] text-ink/60">Codes used</p>
          <p className="font-editorial mt-3 text-4xl text-print-orange">{totals.codesUsed}</p>
          <p className="mt-4 font-mono-display text-[11px] uppercase tracking-wider text-ink/60">
            Lifetime redemptions
          </p>
        </article>
      </section>

      <section className="mt-12">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b-2 border-ink pb-2">
          <div>
            <p className="font-mono-display text-[11px] uppercase tracking-[0.25em] text-print-red">▍ Per service</p>
            <h2 className="font-editorial mt-1 text-3xl font-semibold tracking-tight md:text-4xl">
              Earnings breakdown
            </h2>
          </div>
          <button
            onClick={exportCsv}
            className="inline-flex items-center gap-1.5 border-2 border-ink px-3 py-1.5 hover:bg-ink hover:text-paper font-mono-display text-[11px] uppercase tracking-[0.2em]"
          >
            <Download className="h-3.5 w-3.5" /> CSV
          </button>
        </div>

        {rows.length === 0 ? (
          <VendorEmptyState
            title="No earnings yet."
            hint="Earnings will appear here once your first code is redeemed."
          />
        ) : (
          <ul className="divide-y-2 divide-ink border-2 border-ink bg-card">
            {rows.map((r) => (
              <li key={r.serviceId} className="grid grid-cols-12 items-center gap-3 px-4 py-3 md:px-6">
                <div className="col-span-12 md:col-span-5">
                  <p className="font-editorial text-base leading-tight">{r.name}</p>
                  <p className="font-mono-display text-[10px] uppercase tracking-wider text-ink/55">
                    {formatNaira(r.priceNaira)} · per redemption
                  </p>
                </div>
                <span className="col-span-4 md:col-span-2 font-mono-display text-[11px] uppercase tracking-wider text-ink/60">
                  {r.codesIssued} issued
                </span>
                <span className="col-span-4 md:col-span-2 font-mono-display text-[11px] uppercase tracking-wider text-print-green">
                  {r.codesUsed} used
                </span>
                <span className="col-span-4 md:col-span-3 font-editorial text-right text-lg text-print-green">
                  {formatNaira(r.grossNaira)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
};

export default VendorEarnings;
