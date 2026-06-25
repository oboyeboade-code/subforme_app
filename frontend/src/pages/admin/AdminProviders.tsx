import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import useSWR from "swr";
import {
  Rule,
  MaisonEyebrow,
  MaisonInput,
  StatusBadge,
  UnderlineTabs,
  DataTable,
  StatusDot,
} from "@/components/admin/AdminMaison";
import {
  MissionMasthead,
  StatStrip,
  FilterBar,
  TableSurface,
  SegmentToggle,
} from "@/components/admin/AdminMaisonPlus";
import { CardsSkeleton, AdminEmptyState } from "@/components/admin/AdminStates";
import { V3Card } from "@/components/v3/V3UI";
import { vendorBusinessApi, homeApi, type VendorBusiness, type  Provider } from "@/lib/api/";
import { Search, MapPin, Layers, Pause, Play, LayoutGrid, Rows3 } from "lucide-react";

/* ─────────────────────────────────────────────────────────────
 * AdminProviders — vendor directory.
 * Toggle between editorial table and gallery (card) view.
 * ───────────────────────────────────────────────────────────── */

const adaptVendorToProvider = (v: VendorBusiness): Provider => {
  const [stateLoose = "—", countryLoose = "—"] = (v.address ?? "")
    .split(",")
    .map((s) => s.trim())
    .reverse();
  return {
    id: v._id,
    name: v.businessName,
    category: v.category as string,
    state: stateLoose,
    country: countryLoose,
    services: v.serviceIds?.length ?? 0,
    status:
      v.status === "active" ? "active" : v.status === "suspended" ? "paused" : "pending",
  } as Provider;
};

export const ProviderCard = ({ p, action }: { p: Provider; action?: React.ReactNode }) => (
  <V3Card className="p-6 space-y-4">
    <div className="flex items-center justify-between">
      <MaisonEyebrow>{p.category}</MaisonEyebrow>
      <StatusDot tone={p.status === "active" ? "green" : "muted"} />
    </div>
    <div className="min-w-0">
      <div className="text-lg font-medium text-ink truncate">{p.name}</div>
      <div className="text-xs text-ink/55 flex items-center gap-1 mt-1">
        <MapPin className="w-3 h-3 shrink-0" />
        <span className="truncate">{p.state}, {p.country}</span>
      </div>
    </div>
    <Rule />
    <div className="flex items-center justify-between text-xs text-ink/65">
      <span className="flex items-center gap-1">
        <Layers className="w-3 h-3" /> {p.services} services
      </span>
      <span className="flex items-center gap-1 capitalize">
        {p.status === "active" ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
        {p.status}
      </span>
    </div>
    {action}
  </V3Card>
);

const VENDORS_KEY = "/admin/vendors";
const vendorsFetcher = () =>
  vendorBusinessApi.getVendors().then((r) => (r.data ?? []).map(adaptVendorToProvider));

const AdminProviders = () => {
  const { data: PROVIDER_CATEGORIES = [] } = useSWR("/categories", () =>
    homeApi.getCategories().then((r) => r.data),
  );
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string | "All">("All");
  const [view, setView] = useState<"table" | "cards">("table");

  const { data: providers = [], error, isLoading } = useSWR<Provider[]>(VENDORS_KEY, vendorsFetcher);

  const filtered = useMemo(
    () =>
      providers.filter((p) => {
        const matchesQuery =
          !query ||
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.state.toLowerCase().includes(query.toLowerCase());
        const matchesCat = activeCat === "All" || p.category === activeCat;
        return matchesQuery && matchesCat;
      }),
    [providers, query, activeCat],
  );

  const stats = useMemo(() => {
    const active = providers.filter((p) => p.status === "active").length;
    const paused = providers.filter((p) => p.status === "paused").length;
    const pending = providers.filter((p) => p.status === "pending").length;
    return [
      { label: "Total", value: providers.length.toLocaleString(), hint: "All providers" },
      { label: "Active", value: active.toLocaleString(), hint: "Live storefronts", tone: "green" as const },
      { label: "Paused", value: paused.toLocaleString(), hint: "Temporarily off", tone: "amber" as const },
      { label: "Pending", value: pending.toLocaleString(), hint: "Awaiting approval" },
    ];
  }, [providers]);

  const categoryTabs = [
    { key: "All" as const, label: "All", count: providers.length },
    ...PROVIDER_CATEGORIES.map((cat: any) => ({
      key: cat.name as string,
      label: cat.name,
      count: providers.filter((p) => p.category === cat.name).length,
    })),
  ];

  const columns = [
    {
      key: "name",
      label: "Provider",
      width: "32%",
      render: (row: Provider) => (
        <div className="min-w-0">
          <p className="font-medium text-ink truncate">{row.name}</p>
          <p className="text-xs text-ink/55 flex items-center gap-1 mt-1 truncate">
            <MapPin className="w-3 h-3 shrink-0" /> {row.state}, {row.country}
          </p>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      width: "22%",
      render: (row: Provider) => <MaisonEyebrow>{row.category}</MaisonEyebrow>,
    },
    {
      key: "services",
      label: "Services",
      width: "16%",
      render: (row: Provider) => (
        <span className="inline-flex items-center gap-1.5 text-sm text-ink">
          <Layers className="w-4 h-4 text-ink/45" />
          {row.services}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      width: "20%",
      render: (row: Provider) => (
        <StatusBadge
          status={row.status === "active" ? "active" : row.status === "paused" ? "rejected" : "pending"}
          // label={row.status.charAt(0).toUpperCase() + row.status.slice(1)}
          label={row.status}
          icon={row.status === "active" ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
        />
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <MissionMasthead
        index="III"
        section="Platform"
        title="Providers"
        description="Vendor directory: approved storefronts, onboarding queue, and operational state."
      />

      <StatStrip items={stats} />

      <FilterBar
        right={
          <SegmentToggle
            value={view}
            onChange={setView}
            options={[
              { key: "table", label: <span className="flex items-center gap-1.5"><Rows3 className="h-3 w-3" /> Table</span> },
              { key: "cards", label: <span className="flex items-center gap-1.5"><LayoutGrid className="h-3 w-3" /> Gallery</span> },
            ]}
          />
        }
      >
        <MaisonInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or location…"
          icon={<Search className="h-4 w-4" />}
        />
      </FilterBar>

      <section>
        <UnderlineTabs
          layoutId="provider-tabs"
          tabs={categoryTabs}
          value={activeCat}
          onChange={(v) => setActiveCat(v)}
        />
      </section>

      <section>
        <div className="flex items-baseline justify-between mb-4">
          <MaisonEyebrow>
            {filtered.length} Provider{filtered.length !== 1 ? "s" : ""}
          </MaisonEyebrow>
          <MaisonEyebrow tone="muted">{view === "table" ? "Table view" : "Gallery view"}</MaisonEyebrow>
        </div>

        {isLoading && <CardsSkeleton count={6} />}
        {!isLoading && error && (
          <AdminEmptyState index="00" title="Unable to load providers" hint="Try refreshing or contact support." />
        )}
        {!isLoading && !error && filtered.length === 0 && (
          <AdminEmptyState index="—" title="No providers found" hint="Adjust filters or search terms." />
        )}

        {!isLoading && !error && filtered.length > 0 && view === "table" && (
          <TableSurface>
            <DataTable
              columns={columns}
              data={filtered}
              onRowClick={(row) => console.log("Provider selected:", row)}
            />
          </TableSurface>
        )}

        {!isLoading && !error && filtered.length > 0 && view === "cards" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
          >
            {filtered.map((p) => (
              <ProviderCard key={p.id} p={p} />
            ))}
          </motion.div>
        )}
      </section>

      <Rule weight="hair" />
    </div>
  );
};

export default AdminProviders;
