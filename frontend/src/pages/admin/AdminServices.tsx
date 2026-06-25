import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import useSWR from "swr";
import {
  Rule,
  MaisonEyebrow,
  MonoTag,
  UnderlineTabs,
  DataTable,
  SectionHead,
} from "@/components/admin/AdminMaison";
import { MissionMasthead, StatStrip, TableSurface, BentoCell } from "@/components/admin/AdminMaisonPlus";
import { RowsSkeleton, AdminEmptyState } from "@/components/admin/AdminStates";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  serviceApi,
  vendorBusinessApi,
  homeApi,
  type ServiceCode,
  type AdminService as Service,
  // type AdminService,
  type ProviderCategory,
} from "@/lib/api/";
import { X, Tag } from "lucide-react";

/* ─────────────────────────────────────────────────────────────
 * AdminServices — catalog management with editorial layout.
 * ───────────────────────────────────────────────────────────── */

const SERVICES_KEY = "/admin/services";
const CODES_KEY = "/admin/codes";

const codesFetcher = () => serviceApi.getServiceCodes().then((r) => r.data);
const servicesFetcher = () => serviceApi.getAllServicesAdmin().then((r) => r.data);
// const servicesFetcher = async (): Promise<AdminService[]> => {
//   const res = await serviceApi.listServices();
//   const services: IService[] = res.data.services;
  
//   // Fetch counts in parallel
//   const servicesWithCounts = await Promise.all(
//     services.map(async (s): Promise<AdminService> => {
//       const counts = await codeApi.getCounts(s._id); // { active: 5, total: 20 }
//       return {
//        ...s,
//         activeCodeCount: counts.active,
//         totalCodeCount: counts.total,
//       };
//     })
//   );
  
//   return servicesWithCounts;
// };

const ServiceDetailModal = ({
  service,
  codesForService,
  onClose,
}: {
  service: Service | null;
  codesForService: ServiceCode[];
  onClose: () => void;
}) => {
  const grouped = useMemo(() => {
    const m = new Map<string, { email: string; qty: number }>();
    for (const c of codesForService) {
      const u = typeof c.userId === "object" && c.userId ? c.userId : null;
      const email = u?.email ?? "Unknown";
      if (m.has(email)) m.get(email)!.qty += 1;
      else m.set(email, { email, qty: 1 });
    }
    return Array.from(m.values()).sort((a, b) => b.qty - a.qty);
  }, [codesForService]);

  return (
    <Dialog open={!!service} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-paper border-ink/15 rounded-[6px]">
        <DialogHeader>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
            <div className="min-w-0">
              <MaisonEyebrow>Service detail</MaisonEyebrow>
              <DialogTitle className="font-v3-display text-2xl md:text-3xl tracking-[-0.01em] mt-2 text-ink truncate">
                {service?.name}
              </DialogTitle>
              <DialogDescription className="mt-1 text-ink/55">
                Customer distribution and code ledger.
              </DialogDescription>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-ink/5 rounded-lg shrink-0" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <StatStrip
            items={[
              // { label: "Active", value: (service?.activeCodeCount ?? 0).toLocaleString(), tone: "green" },
              // { label: "Total", value: (service?.totalCodeCount ?? 0).toLocaleString() },
              { label: "Price", value: service?.priceNaira ?? "—" },
            ]}
          />

          <div>
            <SectionHead title="Customer distribution" />
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {grouped.length === 0 ? (
                <p className="text-sm text-ink/50 py-8 text-center">No codes issued yet.</p>
              ) : (
                grouped.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 border border-ink/10 rounded-[4px]"
                  >
                    <p className="text-sm text-ink truncate min-w-0">{item.email}</p>
                    <MonoTag tone="blue">{item.qty} codes</MonoTag>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const AdminServices = () => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [activeCat, setActiveCat] = useState<ProviderCategory | "All">("All");

  const { data: categories = [] } = useSWR("/categories", () =>
    homeApi.getCategories().then((r) => r.data.map(item => item.name)),
  );
  const { data: services = [], error: servicesError, isLoading: servicesLoading } =
    useSWR<Service[]>(SERVICES_KEY, servicesFetcher);
  const { data: codes = [] } = useSWR<ServiceCode[]>(CODES_KEY, codesFetcher);

  const vendorIds = useMemo(() => [...new Set(services.map((s) => s.vendorBusinessId._id))], [services]);
  const { data: vendorMap = {} } = useSWR(
    vendorIds.length > 0 ? `/vendors-batch` : null,
    async () => {
      const vendors = await Promise.all(
        vendorIds.map((id) => vendorBusinessApi.getVendorById(id).then((r) => r.data)),
      );
      const map: Record<string, string> = {};
      vendors.forEach((v, i) => {
        map[vendorIds[i]] = v?.businessName ?? "Unknown";
      });
      return map;
    },
  );

  const filtered =
    activeCat === "All" ? services : services.filter((s) => s.category === activeCat);

  const categoryTabs = [
    { key: "All" as const, label: "All", count: services.length },
    ...categories.map((cat: any) => ({
      key: cat as ProviderCategory,
      label: cat,
      count: services.filter((s) => s.category === cat).length,
    })),
  ];

  const stats = useMemo(() => {
    // const totalActive = services.reduce((acc, s) => acc + (s.activeCodeCount ?? 0), 0);
    // const totalIssued = services.reduce((acc, s) => acc + (s.totalCodeCount ?? 0), 0);
    const totalActive = services.reduce((acc, s) => acc + (0), 0);
    const totalIssued = services.reduce((acc, s) => acc + (0), 0);
    return [
      { label: "Services", value: services.length.toLocaleString(), hint: "Published listings" },
      { label: "Active codes", value: totalActive.toLocaleString(), hint: "Across catalog", tone: "green" as const },
      { label: "Codes issued", value: totalIssued.toLocaleString(), hint: "All-time" },
      { label: "Categories", value: categories.length.toLocaleString(), hint: "Discoverable" },
    ];
  }, [services, categories]);

  const codesForSelectedService = selectedService
    ? codes.filter((c) => c.serviceId === selectedService._id)
    : [];

  const columns = [
    {
      key: "name",
      label: "Service",
      width: "36%",
      render: (row: Service) => (
        <div className="min-w-0">
          <p className="font-medium text-ink truncate">{row.name}</p>
          <p className="text-xs text-ink/55 mt-1 truncate">{vendorMap[row.vendorBusinessId._id] || "Loading…"}</p>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      width: "20%",
      render: (row: Service) => <MaisonEyebrow>{row.category}</MaisonEyebrow>,
    },
    {
      key: "activeCodeCount",
      label: "Active",
      width: "12%",
      render: (row: Service) => (
        <span className="text-sm font-medium text-green-700">
          {"100".toLocaleString()}
          {/* {row.activeCodeCount.toLocaleString()} */}
        </span>
      ),
    },
    {
      key: "totalCodeCount",
      label: "Total",
      width: "12%",
      render: (row: Service) => (
        // <span className="text-sm text-ink/65">{row.totalCodeCount.toLocaleString()}</span>
        <span className="text-sm text-ink/65">{"100".toLocaleString()}</span>
      ),
    },
    {
      key: "priceNaira",
      label: "Price",
      width: "20%",
      render: (row: Service) => (
        <span className="inline-flex items-center gap-1.5 text-sm text-ink font-medium">
          <Tag className="h-3.5 w-3.5 text-ink/40" />
          {row.priceNaira}
        </span>
      ),
    },
  ];
useEffect(() => {
  console.log(categories)
}, [categories])
  return (
    <div className="space-y-8">
      <MissionMasthead
        index="IV"
        section="Platform"
        title="Services"
        description="Service catalog: pricing, availability, and per-listing redemption flow."
      />

      <StatStrip items={stats} />

      <section>
        <UnderlineTabs
          layoutId="service-tabs"
          tabs={categoryTabs}
          value={activeCat}
          onChange={(v) => setActiveCat(v)}
        />
      </section>

      <section>
        <div className="flex items-baseline justify-between mb-4">
          <MaisonEyebrow>
            {filtered.length} Service{filtered.length !== 1 ? "s" : ""}
          </MaisonEyebrow>
          <MaisonEyebrow tone="muted">Click a row to inspect codes</MaisonEyebrow>
        </div>

        {servicesLoading && (
          <BentoCell>
            <RowsSkeleton count={6} />
          </BentoCell>
        )}
        {!servicesLoading && servicesError && (
          <AdminEmptyState index="00" title="Unable to load services" hint="Try refreshing or contact support." />
        )}
        {!servicesLoading && !servicesError && filtered.length === 0 && (
          <AdminEmptyState index="—" title="No services found" hint="Try a different category or create a new service." />
        )}
        {!servicesLoading && !servicesError && filtered.length > 0 && (
          <TableSurface>
            <DataTable columns={columns} data={filtered} onRowClick={(row) => setSelectedService(row)} />
          </TableSurface>
        )}
      </section>

      <ServiceDetailModal
        service={selectedService}
        codesForService={codesForSelectedService}
        onClose={() => setSelectedService(null)}
      />

      <Rule weight="hair" />
    </div>
  );
};

export default AdminServices;
