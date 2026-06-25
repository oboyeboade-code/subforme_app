import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Star,
  CheckCircle2,
  CircleSlash,
  MapPin,
  Calendar,
  Tag,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { V3Card, V3Pill, V3Button } from "@/components/v3/V3UI";
import { Skeleton } from "@/components/ui/skeleton";
import { vendorBusinessApi, userApi } from "@/lib/api/";

const formatNaira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

const V3VendorHome = () => {
  const navigate = useNavigate();

  const { data: me, isLoading: loadingMe } = useQuery({
    queryKey: ["vendor", "me"],
    queryFn: async () => (await vendorBusinessApi.getVendorMe()).data,
  });

  const { data: profileData, isLoading: loadingProfile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await userApi.getProfile()).data,
  });

  const vendor = me?.vendor;
  const services = me?.services ?? [];
  const codes = me?.serviceCodes ?? [];
  const pendingBookings = codes.filter((c) => c.status === "active").length;
  const totalRedemptions = codes.filter((c) => c.status === "used").length;

  const displayName = profileData?.name || vendor?.businessName || "Vendor";
  const isLoading = loadingMe || loadingProfile;

  return (
    <main className="max-w-7xl mx-auto px-5 md:px-8 py-10 md:py-14 space-y-12">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid md:grid-cols-3 gap-5"
      >
        {/* Hero card */}
        <V3Card className="md:col-span-2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-print-red/[0.06] via-transparent to-print-orange/[0.05] pointer-events-none" />
          <div className="relative">
            <V3Pill tone="red" className="mb-3">Vendor portal</V3Pill>
            {isLoading ? (
              <>
                <Skeleton className="h-12 md:h-16 w-3/4 rounded-xl" />
                <Skeleton className="mt-4 h-4 w-full max-w-xl rounded" />
                <Skeleton className="mt-2 h-4 w-2/3 max-w-md rounded" />
                <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-4 w-28 rounded" />
                  <Skeleton className="h-4 w-32 rounded" />
                </div>
              </>
            ) : (
              <>
                <h1 className="font-v3-display text-4xl md:text-6xl tracking-tight leading-[1.02]">
                  {displayName}
                </h1>
                <p className="mt-3 text-sm md:text-base text-ink/65 max-w-xl">
                  {vendor?.description ?? "Welcome to your storefront."}
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink/65">
                  <span className="inline-flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5" /> {vendor?.category ?? "—"}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> Status: {vendor?.status ?? "—"}
                  </span>
                  {vendor?.createdAt && (
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" /> Joined {new Date(vendor.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </V3Card>

        {/* At a glance card */}
        <V3Card className="flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <V3Pill tone="green">At a glance</V3Pill>
            </div>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className={`flex items-baseline justify-between ${i < 3 ? "border-b border-dashed border-ink/15 pb-2" : ""}`}
                  >
                    <Skeleton className="h-3.5 w-28 rounded" />
                    <Skeleton className="h-6 w-10 rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-baseline justify-between border-b border-dashed border-ink/15 pb-2">
                  <span className="text-xs text-ink/65 inline-flex items-center gap-1.5">
                    <Star className="h-3.5 w-3.5" /> Total services
                  </span>
                  <span className="font-v3-display text-xl">{services.length}</span>
                </div>
                <div className="flex items-baseline justify-between border-b border-dashed border-ink/15 pb-2">
                  <span className="text-xs text-ink/65">Active services</span>
                  <span className="font-v3-display text-xl">
                    {services.filter((s) => s.isActive).length}
                  </span>
                </div>
                <div className="flex items-baseline justify-between border-b border-dashed border-ink/15 pb-2">
                  <span className="text-xs text-ink/65">Pending bookings</span>
                  <span className="font-v3-display text-xl">{pendingBookings}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-ink/65">Total redemptions</span>
                  <span className="font-v3-display text-xl">{totalRedemptions.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
          <V3Button
            className="mt-5"
            fullWidth
            onClick={() => navigate("/v3/vendor/dashboard")}
            disabled={isLoading}
          >
            Open dashboard <ArrowRight className="h-3.5 w-3.5" />
          </V3Button>
        </V3Card>
      </motion.section>

      <section>
        <div className="flex items-end justify-between mb-5">
          <div>
            <V3Pill tone="orange" className="mb-2">Catalogue</V3Pill>
            <h2 className="font-v3-display text-2xl md:text-3xl tracking-tight">
              Services on offer
            </h2>
          </div>
          <Link
            to="/v3/vendor/request-listing"
            className="text-xs font-semibold text-print-red hover:underline underline-offset-4"
          >
            + Request a new listing
          </Link>
        </div>

        {loadingMe ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <V3Card key={i} className="h-full flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-2.5 w-20 rounded" />
                    <Skeleton className="h-5 w-3/4 rounded" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-3 w-full rounded" />
                <Skeleton className="h-3 w-5/6 rounded" />
                <div className="mt-auto pt-3 border-t border-ink/8 flex items-center justify-between">
                  <Skeleton className="h-6 w-20 rounded" />
                  <Skeleton className="h-3 w-12 rounded" />
                </div>
              </V3Card>
            ))}
          </div>
        ) : services.length === 0 ? (
          <V3Card className="px-6 py-16 text-center border-dashed">
            <p className="font-v3-display text-2xl">No services yet.</p>
            <p className="mt-2 text-xs text-ink/55">
              Request a listing to add your first offer.
            </p>
          </V3Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((s) => (
              <motion.div
                key={s._id}
                whileHover={{ y: -3 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <V3Card className="h-full flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wider text-ink/45">
                        {s.category}
                      </p>
                      <h3 className="font-v3-display text-lg truncate">{s.name}</h3>
                    </div>
                    {s.isActive ? (
                      <V3Pill tone="green">
                        <CheckCircle2 className="h-3 w-3" /> Active
                      </V3Pill>
                    ) : (
                      <V3Pill tone="ink">
                        <CircleSlash className="h-3 w-3" /> Paused
                      </V3Pill>
                    )}
                  </div>
                  <p className="text-xs text-ink/65 leading-relaxed">{s.description}</p>
                  <div className="mt-auto pt-3 border-t border-ink/8 flex items-center justify-between">
                    <span className="font-v3-display text-lg text-print-red">
                      {formatNaira(s.priceNaira)}
                    </span>
                  </div>
                </V3Card>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default V3VendorHome;
