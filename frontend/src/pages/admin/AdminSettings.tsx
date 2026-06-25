import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useSWR, { mutate as globalMutate } from "swr";
import { motion, AnimatePresence } from "framer-motion";
import { CardsSkeleton, AdminEmptyState } from "@/components/admin/AdminStates";
import {
  Rule, MaisonEyebrow, MaisonInput, MaisonButton,
  MonoTag, ListRow,
} from "@/components/admin/AdminMaison";
import {
  MissionMasthead, StatStrip, FilterBar, TableSurface,
} from "@/components/admin/AdminMaisonPlus";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Search, Plus, Pencil, Trash2, RefreshCw, ShieldCheck, MapPin,
  Pen, Eraser, Sparkles, Users, Radio, ArrowRight,
} from "lucide-react";
import type { Service, Provider, AdminAccount as UIAdminAccount } from "@/lib/page/data";
import {
  homeApi, adminApi, serviceApi, vendorBusinessApi,
  type VendorBusiness, type Service as BackendService,
  type AdminAccount as BackendAdmin,
} from "@/lib/api/";
import { ProviderCard } from "./AdminProviders";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/* ─── adapters (unchanged) ──────────────────────────── */
const adaptVendorToProvider = (v: VendorBusiness): Provider => {
  const [stateLoose = "—", countryLoose = "—"] = (v.address ?? "")
    .split(",").map((s) => s.trim()).reverse();
  return {
    id: v._id, name: v.businessName,
    category: v.category as Provider["category"],
    state: stateLoose, country: countryLoose,
    services: v.serviceIds?.length ?? 0,
    status: v.status === "active" ? "active" : v.status === "suspended" ? "paused" : "pending",
  } as Provider;
};
const adaptBackendService = (s: BackendService): Service => ({
  _id: s._id, name: s.name, category: s.category, priceNaira: s.priceNaira,
} as Service);
const adaptBackendAdmin = (a: BackendAdmin): UIAdminAccount => ({
  id: a._id, name: (a as any).name ?? a.email, email: a.email,
  role: a.role === "super-admin" ? "Super Admin" : "Regional",
  state: (a as any).region ?? "—", country: "—",
} as UIAdminAccount);

const SETTINGS_KEY = "/admin/settings";
const settingsFetcher = async () => {
  const [vendors, services, admins] = await Promise.all([
    vendorBusinessApi.getVendors().then((r) => r.data ?? []),
    serviceApi.getAllServicesAdmin().then((r) => r.data ?? []),
    adminApi.getAdmins().then((r) => r.data ?? []),
  ]);
  return {
    providers: vendors.map(adaptVendorToProvider),
    services: services.map(adaptBackendService),
    admins: admins.map(adaptBackendAdmin),
  };
};
const useAdminSettingsData = () => {
  const { data, error, isLoading } = useSWR(SETTINGS_KEY, settingsFetcher);
  return {
    providers: data?.providers ?? [],
    services: data?.services ?? [],
    admins: data?.admins ?? [],
    error, isLoading,
  };
};

type OpKey = "modify" | "delete" | "create" | "admins" | "refresh";

const OPS: { key: OpKey; index: string; label: string; hint: string; icon: any; tone?: "danger" | "accent" }[] = [
  { key: "modify",  index: "I",   label: "Modify entries",  hint: "Edit providers & services",   icon: Pen },
  { key: "delete",  index: "II",  label: "Delete entries",  hint: "Permanently remove records",  icon: Eraser, tone: "danger" },
  { key: "create",  index: "III", label: "Create entries",  hint: "Add provider or service",     icon: Sparkles, tone: "accent" },
  { key: "admins",  index: "IV",  label: "Admin roster",    hint: "Regional admin accounts",     icon: Users },
  { key: "refresh", index: "V",   label: "Refresh codes",   hint: "Re-sync code microservice",   icon: Radio },
];

const PAGE_SIZE = 6;

const V3Select = ({
  label, children, ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) => (
  <label className="block space-y-1">
    {label && <span className="block text-[10px] uppercase tracking-[0.16em] text-ink/55">{label}</span>}
    <select
      {...rest}
      className={cn(
        "w-full bg-transparent border-b border-ink/20 py-2 text-sm focus:outline-none focus:border-ink",
        rest.className,
      )}
    >
      {children}
    </select>
  </label>
);

/* ─── Operations Rail (vertical command list) ──────────── */
const OperationsRail = ({
  active, onSelect,
}: { active: OpKey; onSelect: (k: OpKey) => void }) => (
  <nav aria-label="Settings operations" className="space-y-1">
    <MaisonEyebrow className="px-3 mb-3">Operations</MaisonEyebrow>
    {OPS.map((op) => {
      const isActive = op.key === active;
      const Icon = op.icon;
      return (
        <button
          key={op.key}
          onClick={() => onSelect(op.key)}
          className={cn(
            "relative w-full text-left flex items-center gap-3 px-3 py-3 rounded-[4px] transition-all",
            "border border-transparent",
            isActive
              ? "bg-ink text-paper"
              : "hover:bg-ink/[0.04] hover:border-ink/15 text-ink",
          )}
        >
          {isActive && (
            <motion.span
              layoutId="op-rail-bar"
              className="absolute left-0 top-2 bottom-2 w-[3px] bg-paper rounded-r"
              transition={{ type: "spring", stiffness: 360, damping: 32 }}
            />
          )}
          <span
            className={cn(
              "font-mono text-[10px] tracking-[0.18em] w-6",
              isActive ? "text-paper/55" : "text-ink/40",
            )}
          >
            {op.index}
          </span>
          <Icon className="h-4 w-4 shrink-0" />
          <span className="flex-1 min-w-0">
            <span className="block text-sm font-medium">{op.label}</span>
            <span
              className={cn(
                "block text-[11px] mt-0.5 truncate",
                isActive ? "text-paper/60" : "text-ink/50",
              )}
            >
              {op.hint}
            </span>
          </span>
          {op.tone === "danger" && !isActive && (
            <MonoTag tone="red" className="text-[9px]">!</MonoTag>
          )}
        </button>
      );
    })}
  </nav>
);

/* ─── ProviderServiceTabs (modernized) ─────────────────── */
const ProviderServiceWorkbench = ({
  mode, onAct,
}: {
  mode: "modify" | "delete";
  onAct: (kind: "provider" | "service", item: Provider | Service) => void;
}) => {
  const { providers, services, isLoading, error } = useAdminSettingsData();
  const [sub, setSub] = useState<"providers" | "services">("providers");
  const [pCount, setPCount] = useState(PAGE_SIZE);
  const [sCount, setSCount] = useState(PAGE_SIZE);
  const [search, setSearch] = useState("");

  const filteredProviders = useMemo(
    () => providers.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())),
    [providers, search],
  );
  const filteredServices = useMemo(
    () => services.filter((s) => s.name.toLowerCase().includes(search.toLowerCase())),
    [services, search],
  );

  if (isLoading) return <CardsSkeleton count={6} />;
  if (error)
    return (
      <AdminEmptyState
        index="00"
        title="The catalog could not be read."
        hint="A network hiccup is the usual culprit — try again in a moment."
      />
    );

  return (
    <div className="space-y-6">
      <StatStrip
        items={[
          { label: "Providers", value: providers.length, hint: "in directory" },
          { label: "Services",  value: services.length,  hint: "in catalog" },
          { label: "Viewing",   value: sub,              hint: mode === "delete" ? "destructive mode" : "edit mode", tone: mode === "delete" ? "danger" : "default" },
        ]}
      />

      <FilterBar>
        <div className="flex-1 min-w-[220px]">
          <MaisonInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${sub}…`}
            icon={<Search className="w-3.5 h-3.5" />}
          />
        </div>
        <div className="inline-flex items-center rounded-[4px] border border-ink/15 p-0.5 bg-paper">
          {(["providers", "services"] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => { setSub(opt); setSearch(""); }}
              className={cn(
                "relative px-4 py-1.5 text-xs uppercase tracking-[0.16em] font-mono transition-colors",
                sub === opt ? "text-paper" : "text-ink/55 hover:text-ink",
              )}
            >
              {sub === opt && (
                <motion.span
                  layoutId="sub-pill"
                  className="absolute inset-0 bg-ink rounded-[3px]"
                  transition={{ type: "spring", stiffness: 360, damping: 32 }}
                />
              )}
              <span className="relative">{opt}</span>
            </button>
          ))}
        </div>
      </FilterBar>

      {sub === "providers" ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProviders.slice(0, pCount).map((p) => (
              <div key={p.id}>
                <ProviderCard
                  p={p}
                  action={
                    <MaisonButton
                      variant={mode === "delete" ? "danger" : "ghost"}
                      size="sm"
                      onClick={() => onAct("provider", p)}
                    >
                      {mode === "delete" ? <Trash2 className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
                      {mode === "delete" ? "Delete" : "Modify"}
                    </MaisonButton>
                  }
                />
              </div>
            ))}
          </div>
          {pCount < filteredProviders.length && (
            <div className="text-center">
              <MaisonButton variant="ghost" onClick={() => setPCount((c) => c + PAGE_SIZE)}>
                Show more
              </MaisonButton>
            </div>
          )}
        </>
      ) : (
        <>
          <TableSurface>
            {filteredServices.slice(0, sCount).map((s) => (
              <ListRow key={s._id}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink">{s.name}</p>
                  <p className="text-xs text-ink/55 mt-1">
                    {(s as any).category} · ₦{(s as any).priceNaira?.toLocaleString?.() ?? "—"}
                  </p>
                </div>
                <MaisonButton
                  variant={mode === "delete" ? "danger" : "ghost"}
                  size="sm"
                  onClick={() => onAct("service", s)}
                >
                  {mode === "delete" ? <Trash2 className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
                  {mode === "delete" ? "Delete" : "Modify"}
                </MaisonButton>
              </ListRow>
            ))}
          </TableSurface>
          {sCount < filteredServices.length && (
            <div className="text-center">
              <MaisonButton variant="ghost" onClick={() => setSCount((c) => c + PAGE_SIZE)}>
                Show more
              </MaisonButton>
            </div>
          )}
        </>
      )}
    </div>
  );
};

/* ─── Dialogs (logic unchanged) ───────────────────────── */
const ModifyDialog = ({
  target, onClose,
}: {
  target: { kind: "provider" | "service"; item: any } | null;
  onClose: () => void;
}) => {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (target) setName(target.item.name); }, [target]);
  if (!target) return null;

  const save = async () => {
    setBusy(true);
    try {
      if (target.kind === "provider") {
        await vendorBusinessApi.updateVendor(target.item.id, { businessName: name });
      } else {
        await serviceApi.updateService(target.item.id, { name });
      }
      await globalMutate(SETTINGS_KEY);
      toast.success(`${target.kind} updated`);
      onClose();
    } catch (e: any) {
      toast.error(e?.message ?? "Save failed");
    } finally { setBusy(false); }
  };

  return (
    <Dialog open={!!target} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <MaisonEyebrow>Edit entry</MaisonEyebrow>
          <DialogTitle>Modify {target.kind}</DialogTitle>
          <DialogDescription>Update {target.kind} details and save.</DialogDescription>
        </DialogHeader>
        <Rule />
        <div className="space-y-4">
          <MaisonInput label="Name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <DialogFooter>
          <MaisonButton variant="ghost" onClick={onClose} disabled={busy}>Cancel</MaisonButton>
          <MaisonButton variant="primary" onClick={save} disabled={busy}>
            {busy ? "Saving…" : "Save changes"}
          </MaisonButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const DeleteDialog = ({
  target, onClose,
}: {
  target: { kind: "provider" | "service"; item: any } | null;
  onClose: () => void;
}) => {
  const [busy, setBusy] = useState(false);
  if (!target) return null;
  const handleDelete = async () => {
    setBusy(true);
    try {
      if (target.kind === "provider") await vendorBusinessApi.deleteVendor(target.item.id);
      else await serviceApi.deleteService(target.item.id);
      await globalMutate(SETTINGS_KEY);
      toast.success(`${target.item.name} deleted`);
      onClose();
    } catch (e: any) {
      toast.error(e?.message ?? "Delete failed");
    } finally { setBusy(false); }
  };
  return (
    <Dialog open={!!target} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <MaisonEyebrow tone="red">Permanent action</MaisonEyebrow>
          <DialogTitle>Delete {target.kind}?</DialogTitle>
          <DialogDescription>
            This will permanently remove <strong>{target.item.name}</strong>. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <Rule />
        <DialogFooter>
          <MaisonButton variant="ghost" onClick={onClose} disabled={busy}>Cancel</MaisonButton>
          <MaisonButton variant="danger" onClick={handleDelete} disabled={busy}>
            {busy ? "Deleting…" : "Delete permanently"}
          </MaisonButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/* ─── Create workbench ───────────────────────────────── */
const CreateWorkbench = () => {
  const { data: PROVIDER_CATEGORIES = [] } = useSWR(
    "/categories",
    () => homeApi.getCategories().then((res) => res.data)
  );
  const [formKind, setFormKind] = useState<"provider" | "service" | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>(PROVIDER_CATEGORIES[0]?.name ?? "");
  const [priceNaira, setPriceNaira] = useState<string>("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!category && PROVIDER_CATEGORIES.length) setCategory(PROVIDER_CATEGORIES[0].name);
  }, [PROVIDER_CATEGORIES, category]);

  const reset = () => {
    setName(""); setPriceNaira("");
    setCategory(PROVIDER_CATEGORIES[0]?.name ?? "");
  };

  const create = async () => {
    if (!formKind) return;
    setBusy(true);
    try {
      if (formKind === "provider") {
        await vendorBusinessApi.createVendor({ businessName: name, category });
      } else {
        await serviceApi.createService({
          name, category, priceNaira: Number(priceNaira) || 0,
        });
      }
      await globalMutate(SETTINGS_KEY);
      toast.success(`${formKind} created`);
      setFormKind(null);
      reset();
    } catch (e: any) {
      toast.error(e?.message ?? "Create failed");
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-6">
      <StatStrip
        items={[
          { label: "Provider", value: "New record", hint: "Add a merchant to the directory" },
          { label: "Service",  value: "New record", hint: "Add an offering to the catalog" },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {(["provider", "service"] as const).map((k) => (
          <button
            key={k}
            onClick={() => { setFormKind(k); reset(); }}
            className={cn(
              "group relative overflow-hidden text-left p-7 rounded-[6px]",
              "border border-ink/15 bg-paper hover:bg-ink hover:text-paper",
              "transition-colors duration-300",
            )}
          >
            <MaisonEyebrow className="group-hover:text-paper/55">Begin a new entry</MaisonEyebrow>
            <div className="font-v3-display text-3xl mt-3 capitalize">{k}</div>
            <p className="text-sm opacity-60 mt-3 max-w-xs">
              {k === "provider"
                ? "Add a merchant or vendor to the directory."
                : "Add an offering tied to providers in the catalog."}
            </p>
            <div className="mt-8 inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em]">
              Create {k} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </button>
        ))}
      </div>

      <Dialog open={!!formKind} onOpenChange={(o) => !o && setFormKind(null)}>
        <DialogContent>
          <DialogHeader>
            <MaisonEyebrow>New entry</MaisonEyebrow>
            <DialogTitle>New {formKind}</DialogTitle>
          </DialogHeader>
          <Rule />
          <div className="space-y-4">
            <MaisonInput label="Name" value={name} onChange={(e) => setName(e.target.value)} />
            {formKind === "service" && (
              <MaisonInput
                label="Price (Naira)" type="number"
                value={priceNaira}
                onChange={(e) => setPriceNaira(e.target.value)}
              />
            )}
            <V3Select
              label="Category" value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {PROVIDER_CATEGORIES.map((c) => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </V3Select>
          </div>
          <DialogFooter>
            <MaisonButton variant="ghost" onClick={() => setFormKind(null)} disabled={busy}>Cancel</MaisonButton>
            <MaisonButton variant="primary" onClick={create} disabled={busy || !name.trim()}>
              {busy ? "Creating…" : `Create ${formKind}`}
            </MaisonButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* ─── Admins workbench ───────────────────────────────── */
const AdminsWorkbench = () => {
  const { admins, isLoading, error } = useAdminSettingsData();
  const [editing, setEditing] = useState<UIAdminAccount | null>(null);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [region, setRegion] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (editing) { setName(editing.name); setEmail(editing.email); setRegion(editing.state ?? ""); }
    else if (creating) { setName(""); setEmail(""); setRegion(""); }
  }, [editing, creating]);

  const filteredAdmins = useMemo(
    () => admins.filter(
      (a) =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.email.toLowerCase().includes(search.toLowerCase()),
    ),
    [admins, search],
  );

  const removeAdmin = async (id: string) => {
    try {
      await adminApi.deleteAdmin(id);
      await globalMutate(SETTINGS_KEY);
      toast.success("Admin removed");
    } catch (e: any) { toast.error(e?.message ?? "Delete failed"); }
  };

  const saveAdmin = async () => {
    setBusy(true);
    try {
      if (editing) {
        await adminApi.updateAdmin(editing.id, {
          email, ...({ name, region } as any),
        });
        toast.success("Admin updated");
      } else {
        await adminApi.createAdmin({
          email, role: "admin", ...({ name, region } as any),
        });
        toast.success("Admin added");
      }
      await globalMutate(SETTINGS_KEY);
      setEditing(null); setCreating(false);
    } catch (e: any) { toast.error(e?.message ?? "Save failed"); }
    finally { setBusy(false); }
  };

  const supers = admins.filter((a) => a.role === "Super Admin").length;
  const regionals = admins.length - supers;

  return (
    <div className="space-y-6">
      <StatStrip
        items={[
          { label: "Total admins", value: admins.length },
          { label: "Super",        value: supers, tone: "danger" },
          { label: "Regional",     value: regionals, tone: "accent" },
        ]}
      />

      <FilterBar>
        <div className="flex-1 min-w-[220px]">
          <MaisonInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search admins by name or email…"
            icon={<Search className="w-3.5 h-3.5" />}
          />
        </div>
        <MaisonButton variant="primary" onClick={() => setCreating(true)}>
          <Plus className="w-3.5 h-3.5" /> Add admin
        </MaisonButton>
      </FilterBar>

      {isLoading ? (
        <CardsSkeleton count={4} cols="grid-cols-1 md:grid-cols-2" />
      ) : error ? (
        <AdminEmptyState
          index="00"
          title="Admins could not be loaded."
          hint="A network hiccup is the usual culprit — try again in a moment."
        />
      ) : filteredAdmins.length === 0 ? (
        <AdminEmptyState
          index="—"
          title="No admins found."
          hint={search ? "No admins match this search." : "Add a regional admin to delegate provider oversight."}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredAdmins.map((a) => (
            <div
              key={a.id}
              className="group relative rounded-[6px] border border-ink/15 bg-card p-6 hover:border-ink/40 hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-center justify-between">
                <MaisonEyebrow>{a.role}</MaisonEyebrow>
                {a.role === "Super Admin" ? (
                  <MonoTag tone="red"><ShieldCheck className="w-3 h-3 inline mr-1" />Super</MonoTag>
                ) : (
                  <MonoTag>Regional</MonoTag>
                )}
              </div>
              <div className="mt-5 flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-ink text-paper flex items-center justify-center text-xs font-medium">
                  {a.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-ink font-medium">{a.name}</div>
                  <div className="text-xs text-ink/55">{a.email}</div>
                </div>
              </div>
              <Rule className="my-4" />
              <div className="flex items-center justify-between">
                <div className="text-xs text-ink/55 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {a.state}, {a.country}
                </div>
                <div className="flex gap-2">
                  <MaisonButton variant="ghost" size="sm" onClick={() => setEditing(a)}>
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </MaisonButton>
                  {a.role !== "Super Admin" && (
                    <MaisonButton variant="danger" size="sm" onClick={() => removeAdmin(a.id)}>
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </MaisonButton>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={!!editing || creating}
        onOpenChange={(o) => { if (!o) { setEditing(null); setCreating(false); } }}
      >
        <DialogContent>
          <DialogHeader>
            <MaisonEyebrow>{editing ? "Edit" : "New entry"}</MaisonEyebrow>
            <DialogTitle>{editing ? "Edit admin" : "Add admin"}</DialogTitle>
            <DialogDescription>Regional admins manage providers within a single state.</DialogDescription>
          </DialogHeader>
          <Rule />
          <div className="space-y-4">
            <MaisonInput label="Name"          value={name}   onChange={(e) => setName(e.target.value)} />
            <MaisonInput label="Email"         value={email}  onChange={(e) => setEmail(e.target.value)} />
            <MaisonInput label="Region / State" value={region} onChange={(e) => setRegion(e.target.value)} />
          </div>
          <DialogFooter>
            <MaisonButton variant="ghost" onClick={() => { setEditing(null); setCreating(false); }} disabled={busy}>Cancel</MaisonButton>
            <MaisonButton variant="primary" onClick={saveAdmin} disabled={busy || !email.trim()}>
              {busy ? "Saving…" : editing ? "Save" : "Add"}
            </MaisonButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* ─── Refresh workbench ──────────────────────────────── */
const RefreshWorkbench = () => {
  const [busy, setBusy] = useState(false);
  const [last, setLast] = useState<string | null>(null);

  const run = async () => {
    setBusy(true);
    try {
      await serviceApi.refreshServiceCodes();
      await Promise.all([
        globalMutate("/admin/overview"),
        globalMutate("/admin/codes"),
        globalMutate("/admin/services"),
        globalMutate("/admin/vendors"),
        globalMutate(SETTINGS_KEY),
      ]);
      setLast(new Date().toLocaleString());
      toast.success("Code status refreshed");
    } catch (e: any) { toast.error(e?.message ?? "Refresh failed"); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-6">
      <StatStrip
        items={[
          { label: "Service",      value: "Code microservice" },
          { label: "Last refresh", value: last ?? "—" },
          { label: "State",        value: busy ? "Running" : "Idle", tone: busy ? "accent" : "default" },
        ]}
      />

      <div className="relative overflow-hidden rounded-[8px] border border-ink/15 bg-card p-10 md:p-14 text-center">
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "16px 16px" }} />
        <div className="relative">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-ink/20 mb-6">
            <RefreshCw className={cn("w-7 h-7 text-ink/70", busy && "animate-spin")} />
          </div>
          <MaisonEyebrow>Maintenance</MaisonEyebrow>
          <div className="font-v3-display text-3xl md:text-4xl mt-3">Refresh code status</div>
          <p className="text-sm text-ink/60 mt-3 max-w-md mx-auto">
            Pulls the latest expirations from the code microservice and loads newly issued codes.
          </p>
          <div className="mt-7">
            <MaisonButton variant="primary" size="lg" onClick={run} disabled={busy}>
              {busy ? "Refreshing…" : "Refresh now"}
            </MaisonButton>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Page shell ──────────────────────────────────────── */
const AdminSettings = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initial = (location.hash.replace("#", "") as OpKey) || "modify";
  const [op, setOp] = useState<OpKey>(OPS.some((t) => t.key === initial) ? initial : "modify");
  const [modifyTarget, setModifyTarget] = useState<{ kind: "provider" | "service"; item: any } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ kind: "provider" | "service"; item: any } | null>(null);

  useEffect(() => {
    const h = location.hash.replace("#", "") as OpKey;
    if (h && OPS.some((t) => t.key === h)) setOp(h);
  }, [location.hash]);

  const switchOp = (k: OpKey) => {
    setOp(k);
    navigate(`/admin/settings#${k}`, { replace: true });
  };

  const current = OPS.find((o) => o.key === op)!;

  return (
    <div className="space-y-8">
      <MissionMasthead
        index="No. 04"
        section="Operations"
        title="Settings"
        lede="The operations console. Pick an action on the left rail; the workbench on the right responds."
      />

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
        <aside className="lg:sticky lg:top-24">
          <OperationsRail active={op} onSelect={switchOp} />
        </aside>

        <section>
          <div className="mb-6 flex items-baseline justify-between gap-4 border-b border-ink/10 pb-4">
            <div>
              <MaisonEyebrow>Workbench · {current.index}</MaisonEyebrow>
              <h2 className="font-v3-display text-3xl md:text-4xl tracking-[-0.01em] mt-2">{current.label}</h2>
              <p className="text-sm text-ink/55 mt-1">{current.hint}</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={op}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              {op === "modify"  && <ProviderServiceWorkbench mode="modify" onAct={(kind, item) => setModifyTarget({ kind, item })} />}
              {op === "delete"  && <ProviderServiceWorkbench mode="delete" onAct={(kind, item) => setDeleteTarget({ kind, item })} />}
              {op === "create"  && <CreateWorkbench />}
              {op === "admins"  && <AdminsWorkbench />}
              {op === "refresh" && <RefreshWorkbench />}
            </motion.div>
          </AnimatePresence>
        </section>
      </div>

      <ModifyDialog target={modifyTarget} onClose={() => setModifyTarget(null)} />
      <DeleteDialog target={deleteTarget} onClose={() => setDeleteTarget(null)} />
    </div>
  );
};

export default AdminSettings;
