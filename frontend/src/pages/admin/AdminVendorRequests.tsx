import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSWR from "swr";
import {
  Rule,
  MaisonEyebrow,
  MaisonInput,
  MaisonButton,
  MonoTag,
  UnderlineTabs,
  StatusBadge,
} from "@/components/admin/AdminMaison";
import { MissionMasthead, StatStrip, BentoCell, PulseDot } from "@/components/admin/AdminMaisonPlus";
import { AdminEmptyState } from "@/components/admin/AdminStates";
import { adminApi, type IListingRequest } from "@/lib/api/";
import {
  Search,
  Loader2,
  Check,
  X,
  MapPin,
  Globe,
  Phone,
  Mail,
  ChevronRight,
  ClipboardList,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────
 * AdminVendorRequests — listing petition triage as split-pane.
 * ───────────────────────────────────────────────────────────── */

export type VendorRequestStatus = "pending" | "approved" | "rejected";

export interface VendorServiceRequest {
  _id: string;
  businessName: string;
  contactName: string;
  email: string;
  phone?: string;
  category: string;
  state?: string;
  country?: string;
  website?: string;
  servicesProposed?: string[];
  message?: string;
  status: VendorRequestStatus;
  createdAt: string;
  reviewedAt?: string;
  reviewerNote?: string;
}

const adapt = (l: IListingRequest & { _id?: string }): VendorServiceRequest => {
  const [stateLoose, countryLoose] = (l.address ?? "")
    .split(",")
    .map((s) => s.trim())
    .reverse();
  return {
    _id: (l as any)._id ?? "",
    businessName: l.businessName,
    contactName: l.contactName,
    email: l.email,
    phone: l.phone,
    category: l.category,
    state: stateLoose,
    country: countryLoose,
    website: l.website,
    servicesProposed: l.serviceName ? [l.serviceName] : [],
    message: l.description,
    status: l.status,
    createdAt: l.createdAt,
    reviewedAt: l.reviewedAt,
    reviewerNote: l.rejectionReason,
  };
};

const TABS = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "all", label: "All" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

const REQUESTS_KEY = "/admin/listing-requests";
const fetcher = () =>
  adminApi.getListingRequests().then((r) => (r.data ?? []).map(adapt));

const AdminVendorRequests = () => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("pending");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: requests = [], error, isLoading, mutate } =
    useSWR<VendorServiceRequest[]>(REQUESTS_KEY, fetcher);

  const filtered = useMemo(() => {
    let r = requests;
    if (activeTab !== "all") r = r.filter((x) => x.status === activeTab);
    const q = search.trim().toLowerCase();
    if (q) {
      r = r.filter(
        (x) =>
          x.businessName.toLowerCase().includes(q) ||
          x.contactName.toLowerCase().includes(q) ||
          x.email.toLowerCase().includes(q) ||
          x.category.toLowerCase().includes(q),
      );
    }
    return [...r].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [requests, search, activeTab]);

  useEffect(() => {
    if (!selectedId && filtered.length) setSelectedId(filtered[0]._id);
    if (selectedId && !filtered.find((m) => m._id === selectedId)) {
      setSelectedId(filtered[0]?._id ?? null);
    }
  }, [filtered, selectedId]);

  const selected = useMemo(
    () => requests.find((r) => r._id === selectedId) ?? null,
    [requests, selectedId],
  );

  const tabs = [
    { key: "pending" as const, label: "Pending", count: requests.filter((r) => r.status === "pending").length },
    { key: "approved" as const, label: "Approved", count: requests.filter((r) => r.status === "approved").length },
    { key: "rejected" as const, label: "Rejected", count: requests.filter((r) => r.status === "rejected").length },
    { key: "all" as const, label: "All", count: requests.length },
  ];

  const stats = useMemo(() => {
    const pending = requests.filter((r) => r.status === "pending").length;
    return [
      { label: "Petitions", value: requests.length.toLocaleString(), hint: "All-time" },
      { label: "Pending", value: pending.toLocaleString(), hint: "Awaiting review", tone: pending ? ("amber" as const) : undefined },
      { label: "Approved", value: requests.filter((r) => r.status === "approved").length.toLocaleString(), hint: "Onboarded", tone: "green" as const },
      { label: "Rejected", value: requests.filter((r) => r.status === "rejected").length.toLocaleString(), hint: "Declined", tone: "red" as const },
    ];
  }, [requests]);

  return (
    <div className="space-y-8">
      <MissionMasthead
        index="VII"
        section="Support"
        title="Listing petitions"
        description="Vendors petitioning to list a new service. Review documents and approve or decline with a note."
        actions={
          <div className="hidden md:flex items-center gap-2">
            <PulseDot tone={stats[1].value === "0" ? "green" : "amber"} />
            <MaisonEyebrow>
              {stats[1].value === "0" ? "Queue empty" : `${stats[1].value} to review`}
            </MaisonEyebrow>
          </div>
        }
      />

      <StatStrip items={stats} />

      <div className="space-y-5">
        <MaisonInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by business, contact, email, category…"
          icon={<Search className="h-4 w-4" />}
        />

        <UnderlineTabs
          layoutId="requests-tabs"
          tabs={tabs}
          value={activeTab}
          onChange={(v) => setActiveTab(v)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-5 min-h-[60vh]">
        {/* List */}
        <BentoCell className="p-0 overflow-hidden">
          {isLoading && (
            <div className="p-10 flex items-center justify-center text-ink/50">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          )}
          {!isLoading && error && (
            <div className="p-6">
              <AdminEmptyState index="00" title="Unable to load petitions" />
            </div>
          )}
          {!isLoading && !error && filtered.length === 0 && (
            <div className="p-6">
              <AdminEmptyState
                index="—"
                title="No petitions"
                hint={search ? "Adjust your filters." : "Nothing matches this view."}
              />
            </div>
          )}
          {!isLoading && !error && filtered.length > 0 && (
            <ul className="divide-y divide-ink/8 max-h-[70vh] overflow-y-auto">
              {filtered.map((r) => {
                const isActive = r._id === selectedId;
                return (
                  <li key={r._id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(r._id)}
                      className={cn(
                        "w-full text-left flex items-start gap-3 px-5 py-4 transition-colors",
                        isActive ? "bg-ink/[0.04]" : "hover:bg-ink/[0.02]",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-2 h-2 w-2 rounded-full shrink-0",
                          r.status === "pending" && "bg-amber-500",
                          r.status === "approved" && "bg-green-500",
                          r.status === "rejected" && "bg-red-500",
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-3 mb-1">
                          <p className="text-sm font-semibold text-ink truncate">{r.businessName}</p>
                          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink/45 whitespace-nowrap shrink-0">
                            {fmtDate(r.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-ink/70 truncate">{r.contactName} · {r.category}</p>
                        <p className="text-xs text-ink/50 truncate mt-1">{r.email}</p>
                      </div>
                      <ChevronRight className={cn("h-4 w-4 shrink-0 mt-2", isActive ? "text-ink" : "text-ink/25")} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </BentoCell>

        {/* Preview */}
        <BentoCell className="p-0 overflow-hidden">
          <AnimatePresence mode="wait">
            {!selected ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full min-h-[40vh] flex flex-col items-center justify-center text-center p-10 text-ink/40"
              >
                <ClipboardList className="h-8 w-8 mb-3" />
                <MaisonEyebrow>Nothing selected</MaisonEyebrow>
                <p className="mt-3 text-sm text-ink/55 max-w-xs">
                  Pick a petition to review it here.
                </p>
              </motion.div>
            ) : (
              <RequestPreview key={selected._id} request={selected} onChanged={() => mutate()} />
            )}
          </AnimatePresence>
        </BentoCell>
      </div>

      <Rule weight="hair" />
    </div>
  );
};

const RequestPreview = ({
  request,
  onChanged,
}: {
  request: VendorServiceRequest;
  onChanged: () => void;
}) => {
  const [acting, setActing] = useState<null | "approve" | "reject">(null);
  const [note, setNote] = useState("");

  const decide = async (kind: "approve" | "reject") => {
    setActing(kind);
    try {
      await adminApi.reviewListingRequest(request._id,
        kind === "approve" ? "approved" : "rejected",
        kind === "reject" ? note : undefined,
      );
      toast.success(kind === "approve" ? "Approved" : "Rejected");
      onChanged();
    } catch (e: any) {
      toast.error(e?.message ?? "Action failed");
    } finally {
      setActing(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="h-full flex flex-col"
    >
      <div className="px-7 pt-7 pb-5 border-b border-ink/10">
        <MaisonEyebrow>Submitted {fmtDate(request.createdAt)}</MaisonEyebrow>
        <h2 className="font-v3-display text-2xl md:text-3xl tracking-[-0.01em] text-ink mt-3 truncate">
          {request.businessName}
        </h2>
        <div className="mt-3 flex items-center gap-3 flex-wrap">
          <span className="text-sm text-ink/65 truncate min-w-0">{request.contactName}</span>
          <StatusBadge
            status={request.status as any}
            label={
              request.status === "pending"
                ? "Pending"
                : request.status === "approved"
                  ? "Approved"
                  : "Rejected"
            }
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-7 py-6 space-y-6">
        {/* Detail grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
          <Field label="Category" value={request.category} />
          <Field
            label="Location"
            value={
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-ink/45" />
                {request.state}, {request.country}
              </span>
            }
          />
        </div>

        {/* Contact card */}
        <div className="border border-ink/10 rounded-[4px] p-4 space-y-2.5">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-ink/45 shrink-0" />
            <a href={`mailto:${request.email}`} className="text-ink underline underline-offset-4 decoration-ink/30 truncate">
              {request.email}
            </a>
          </div>
          {request.phone && (
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-ink/45 shrink-0" />
              <a href={`tel:${request.phone}`} className="text-ink truncate">{request.phone}</a>
            </div>
          )}
          {request.website && (
            <div className="flex items-center gap-3 text-sm">
              <Globe className="h-4 w-4 text-ink/45 shrink-0" />
              <a
                href={request.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink underline underline-offset-4 decoration-ink/30 truncate"
              >
                {request.website}
              </a>
            </div>
          )}
        </div>

        {request.servicesProposed && request.servicesProposed.length > 0 && (
          <div>
            <MaisonEyebrow>Proposed services</MaisonEyebrow>
            <div className="mt-3 flex flex-wrap gap-2">
              {request.servicesProposed.map((s, i) => (
                <MonoTag key={i} tone="blue">{s}</MonoTag>
              ))}
            </div>
          </div>
        )}

        {request.message && (
          <div>
            <MaisonEyebrow>Message</MaisonEyebrow>
            <div className="mt-3 p-4 border border-ink/10 rounded-[4px]">
              <p className="text-sm leading-relaxed text-ink whitespace-pre-wrap">{request.message}</p>
            </div>
          </div>
        )}

        {request.status === "rejected" && request.reviewerNote && (
          <div>
            <MaisonEyebrow tone="red">Rejection reason</MaisonEyebrow>
            <div className="mt-3 p-4 border border-red-200 bg-red-50 rounded-[4px]">
              <p className="text-sm text-red-900">{request.reviewerNote}</p>
            </div>
          </div>
        )}

        {request.status === "pending" && (
          <div>
            <MaisonEyebrow>Reviewer note (required to reject)</MaisonEyebrow>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Reason or additional context…"
              className="mt-3 w-full bg-transparent border border-ink/15 rounded-[4px] px-3 py-2 text-sm text-ink placeholder:text-ink/35 focus:outline-none focus:border-ink"
            />
          </div>
        )}
      </div>

      {request.status === "pending" && (
        <div className="border-t border-ink/10 px-7 py-4 flex items-center gap-3 flex-wrap">
          <MaisonButton
            variant="primary"
            size="sm"
            onClick={() => decide("approve")}
            disabled={acting !== null}
          >
            {acting === "approve" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Approve
          </MaisonButton>
          <MaisonButton
            variant="danger"
            size="sm"
            onClick={() => decide("reject")}
            disabled={acting !== null}
          >
            {acting === "reject" ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
            Reject
          </MaisonButton>
        </div>
      )}
    </motion.div>
  );
};

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="min-w-0">
    <MaisonEyebrow>{label}</MaisonEyebrow>
    <p className="mt-2 text-sm text-ink truncate">{value}</p>
  </div>
);

export default AdminVendorRequests;
