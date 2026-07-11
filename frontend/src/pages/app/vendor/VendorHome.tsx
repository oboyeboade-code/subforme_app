import { Link, useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  CheckCircle2,
  CircleSlash,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { vendorBusinessApi, userApi } from "@/lib/api/";
import {
  VendorHeroSkeleton,
  VendorCardsSkeleton,
  VendorEmptyState,
} from "@/components/app/VendorStates";

const formatNaira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

const VendorHome = () => {
  const navigate = useNavigate();
  
  const { data: me, isLoading: meLoading } = useQuery({
    queryKey: ["vendor", "me"],
    queryFn: async () => (await vendorBusinessApi.getVendorMe()).data,
  });

  // Added profile query for identity/display name
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await userApi.getProfile()).data,
  });

  const isLoading = meLoading || profileLoading;
  const vendor = me?.vendor;
  const services = me?.services ?? [];
  const codes = me?.serviceCodes ?? [];
  const pendingCount = codes.filter((c) => c.status === "active").length;
  const totalRedemptions = codes.filter((c) => c.status === "used").length;

  // Consistent display name logic
  const displayName = profileData?.name || vendor?.businessName || "Vendor";

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-10 md:py-14 space-y-14">
        <VendorHeroSkeleton />
        <section>
          <div className="mb-5 border-b-2 border-ink pb-2">
            <div className="h-3 w-24 bg-ink/10 animate-pulse rounded-[2px]" />
            <div className="mt-2 h-8 w-64 bg-ink/10 animate-pulse rounded-[2px]" />
          </div>
          <VendorCardsSkeleton count={3} />
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 md:px-10 md:py-14 space-y-14">
      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2 border-2 border-ink bg-paper-deep p-6 shadow-[6px_6px_0_0_hsl(var(--ink))]">
          <p className="font-mono-display text-[11px] uppercase tracking-[0.25em] text-print-red">
            ▍ Provider
          </p>
          <h1 className="font-editorial mt-2 text-5xl font-semibold leading-none tracking-tight md:text-7xl">
            {isLoading ? "Loading…" : displayName}
          </h1>
          <p className="font-editorial mt-4 max-w-xl text-lg italic text-ink/75">
            {vendor?.description ?? "Welcome to your storefront."}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono-display text-[11px] uppercase tracking-[0.2em] text-ink/65">
            <span>{vendor?.category ?? "—"}</span>
            <span>·</span>
            <span>Status: {vendor?.status ?? "—"}</span>
            {vendor?.createdAt && (
              <>
                <span>·</span>
                <span>Joined {new Date(vendor.createdAt).toLocaleDateString()}</span>
              </>
            )}
          </div>
        </div>

        <aside className="border-2 border-ink bg-card p-5 shadow-[4px_4px_0_0_hsl(var(--ink))] flex flex-col justify-between">
          <div>
            <p className="font-mono-display text-[11px] uppercase tracking-[0.3em] text-print-red">
              At a glance
            </p>
            <div className="mt-4 space-y-3 font-mono-display text-sm">
              <div className="flex items-baseline justify-between border-b border-dashed border-ink/40 pb-2">
                <span className="text-ink/70">Active services</span>
                <span className="font-editorial text-xl">
                  {services.filter((s) => s.isActive).length}
                </span>
              </div>
              <div className="flex items-baseline justify-between border-b border-dashed border-ink/40 pb-2">
                <span className="text-ink/70">Pending bookings</span>
                <span className="font-editorial text-xl">{pendingCount}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-ink/70">Total redemptions</span>
                <span className="font-editorial text-xl">
                  {totalRedemptions.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate("/vendor/dashboard")}
            className="mt-5 inline-flex items-center justify-center gap-1.5 bg-print-green px-4 py-2 font-mono-display text-[11px] font-semibold uppercase tracking-wider text-paper transition-transform hover:-translate-y-0.5"
          >
            Open dashboard <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </aside>
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between border-b-2 border-ink pb-2">
          <div>
            <p className="font-mono-display text-[11px] uppercase tracking-[0.25em] text-print-red">
              ▍ Catalogue
            </p>
            <h2 className="font-editorial mt-1 text-3xl font-semibold tracking-tight md:text-4xl">
              Services on offer
            </h2>
          </div>
          <Link
            to="/vendor/request-listing"
            className="font-mono-display text-[11px] uppercase tracking-[0.25em] text-print-red underline-offset-4 hover:underline"
          >
            + Request listing
          </Link>
        </div>

        {services.length === 0 ? (
          <VendorEmptyState
            title="No services yet."
            hint="Request a listing to add your first offer."
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <article
                key={s._id}
                className="group relative border-2 border-ink bg-card p-5 shadow-[4px_4px_0_0_hsl(var(--ink))] transition-transform hover:-translate-y-0.5 flex flex-col"
              >
                <span
                  className={`absolute -right-px -top-px px-2 py-0.5 font-mono-display text-[10px] uppercase tracking-[0.2em] ${
                    s.isActive ? "bg-print-green text-paper" : "bg-ink/70 text-paper"
                  }`}
                >
                  {s.isActive ? (
                    <span className="inline-flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <CircleSlash className="h-3 w-3" /> Paused
                    </span>
                  )}
                </span>
                <p className="font-mono-display text-[10px] uppercase tracking-[0.25em] text-ink/60">
                  {s.category}
                </p>
                <h3 className="font-editorial mt-1 text-xl font-semibold leading-tight">
                  {s.name}
                </h3>
                <p className="font-mono-display mt-2 text-xs text-ink/70 leading-relaxed">
                  {s.description}
                </p>
                <div className="mt-auto pt-4 flex items-center justify-between border-t border-ink/20">
                  <span className="font-editorial text-2xl text-print-red">
                    {formatNaira(s.priceNaira)}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default VendorHome;
