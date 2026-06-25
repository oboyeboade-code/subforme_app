import { useState, useMemo } from "react";
import useSWR, { mutate as globalMutate } from "swr";
import {
  Rule,
  MaisonEyebrow,
  MaisonButton,
  StatusBadge,
  DataTable,
  MaisonInput,
  Alert,
} from "@/components/admin/AdminMaison";
import { MissionMasthead, StatStrip, FilterBar, TableSurface } from "@/components/admin/AdminMaisonPlus";
import { ListRowsSkeleton, AdminEmptyState } from "@/components/admin/AdminStates";
import { RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import { serviceApi, type ServiceCode, type AdminService as Service } from "@/lib/api/";

/* ─────────────────────────────────────────────────────────────
 * AdminCodes — redemption ledger.
 * ───────────────────────────────────────────────────────────── */

const CODES_KEY = "/admin/codes";
const SERVICES_KEY = "/admin/services";
const codesFetcher = () => serviceApi.getServiceCodes().then((r) => r.data);
const servicesFetcher = () => serviceApi.getAllServicesAdmin().then((r) => r.data);

const codeEmail = (c: ServiceCode): string =>
  typeof c.userId === "object" && c.userId ? (c.userId as any).email : "Customer";
const codeIdentifier = (c: ServiceCode): string => c.serv_code || c.auth_code || c._id;

const statusMap: Record<string, "active" | "expired" | "used" | "unknown"> = {
  active: "active",
  expired: "expired",
  voided: "expired",
  used: "used",
};

const AdminCodes = () => {
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const { data: codes = [], error: codesErr, isLoading } =
    useSWR<ServiceCode[]>(CODES_KEY, codesFetcher);
  const { data: services = [] } = useSWR<Service[]>(SERVICES_KEY, servicesFetcher);

  const serviceNameById = useMemo(() => {
    const m = new Map<string, string>();
    services.forEach((s) => m.set(s._id, s.name));
    return m;
  }, [services]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return codes;
    return codes.filter((c) =>
      codeEmail(c).toLowerCase().includes(q) || codeIdentifier(c).toLowerCase().includes(q),
    );
  }, [codes, search]);

  const handleRefreshCodes = async () => {
    setRefreshing(true);
    try {
      await serviceApi.refreshServiceCodes();
      await globalMutate(CODES_KEY);
      toast.success("Code statuses refreshed");
    } catch (e: any) {
      toast.error(e?.message ?? "Refresh failed");
    } finally {
      setRefreshing(false);
    }
  };

  const stats = useMemo(() => {
    const active = codes.filter((c) => c.status === "active").length;
    const expired = codes.filter((c) => c.status === "expired" || c.status === "voided").length;
    const used = codes.filter((c) => c.status === "used").length;
    return [
      { label: "Total", value: codes.length.toLocaleString(), hint: "All-time issued" },
      { label: "Active", value: active.toLocaleString(), hint: "Redeemable now", tone: "green" as const },
      { label: "Redeemed", value: used.toLocaleString(), hint: "Customer used" },
      { label: "Expired", value: expired.toLocaleString(), hint: "Voided / past due", tone: "red" as const },
    ];
  }, [codes]);

  const columns = [
    {
      key: "serv_code",
      label: "Code",
      width: "22%",
      render: (row: ServiceCode) => (
        <p className="font-mono text-sm font-medium text-ink truncate">{codeIdentifier(row)}</p>
      ),
    },
    {
      key: "userId",
      label: "Customer",
      width: "25%",
      render: (row: ServiceCode) => (
        <p className="text-sm text-ink truncate">{codeEmail(row)}</p>
      ),
    },
    {
      key: "serviceId",
      label: "Service",
      width: "22%",
      render: (row: ServiceCode) => (
        <p className="text-sm text-ink/75 truncate">
          {serviceNameById.get(row.serviceId) || "Unknown"}
        </p>
      ),
    },
    {
      key: "expiryDate",
      label: "Expiry",
      width: "13%",
      render: (row: ServiceCode) => (
        <p className="text-sm text-ink/60">
          {row.expiresAt ? new Date(row.expiresAt).toLocaleDateString("en-GB") : "—"}
        </p>
      ),
    },
    {
      key: "status",
      label: "Status",
      width: "18%",
      render: (row: ServiceCode) => (
        <StatusBadge
          status={statusMap[row.status] || "unknown"}
          // label={row.status.charAt(0).toUpperCase() + row.status.slice(1)}
          label={row.status}
        />
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <MissionMasthead
        index="V"
        section="Platform"
        title="Redemption Codes"
        description="Full ledger of service codes — issued, active, redeemed, expired. Refresh syncs the latest expirations."
        actions={
          <MaisonButton variant="ghost" size="sm" onClick={handleRefreshCodes} disabled={refreshing}>
            <RefreshCw className={"h-4 w-4 " + (refreshing ? "animate-spin" : "")} />
            {refreshing ? "Refreshing…" : "Refresh status"}
          </MaisonButton>
        }
      />

      <StatStrip items={stats} />

      <FilterBar>
        <MaisonInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by customer email or code…"
          icon={<Search className="h-4 w-4" />}
        />
      </FilterBar>

      <section>
        <div className="flex items-baseline justify-between mb-4">
          <MaisonEyebrow>
            {filtered.length} Code{filtered.length !== 1 ? "s" : ""}
          </MaisonEyebrow>
          {search && (
            <MaisonEyebrow tone="muted">Filtered from {codes.length}</MaisonEyebrow>
          )}
        </div>

        {isLoading && <ListRowsSkeleton count={8} />}
        {!isLoading && codesErr && (
          <Alert type="error" title="Unable to load codes" message="Refresh or check connection." />
        )}
        {!isLoading && !codesErr && filtered.length === 0 && (
          <AdminEmptyState
            index="—"
            title="No codes found"
            hint={search ? "Try adjusting your search terms." : "No codes have been issued yet."}
          />
        )}
        {!isLoading && !codesErr && filtered.length > 0 && (
          <TableSurface>
            <DataTable columns={columns} data={filtered} />
          </TableSurface>
        )}
      </section>

      <Rule weight="hair" />
    </div>
  );
};

export default AdminCodes;
