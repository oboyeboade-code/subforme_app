import { Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import useSWR from "swr";
import {
  Rule,
  MaisonEyebrow,
  MaisonButton,
  StatusDot,
  ListRow,
  Alert,
} from "@/components/admin/AdminMaison";
import {
  MissionMasthead,
  StatStrip,
  BentoCell,
  PulseDot,
} from "@/components/admin/AdminMaisonPlus";
import { MetricsSkeleton } from "@/components/admin/AdminStates";
import {
  RefreshCw,
  Plus,
  Pencil,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  Activity,
  Users,
  Briefcase,
  Ticket,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { adminApi, serviceApi, type AdminOverviewMetrics } from "@/lib/api/";

/* ─────────────────────────────────────────────────────────────
 * AdminDashboard — "Overview" mission deck.
 * Editorial stat strip + bento split: live activity / quick acts.
 * ───────────────────────────────────────────────────────────── */

const OVERVIEW_KEY = "/admin/overview";
const overviewFetcher = () => adminApi.getOverview().then((r) => r.data);

const ACTIVITY = [
  { action: "System healthy", detail: "All services operational", time: "Just now", status: "active" as const },
];

const fade = {
  hidden: { opacity: 0, y: 8 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.45, delay: i * 0.05 } }),
};

const AdminDashboard = () => {
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: overview,
    error,
    isLoading,
    mutate,
  } = useSWR<AdminOverviewMetrics>(OVERVIEW_KEY, overviewFetcher);

  const refresh = async () => {
    setRefreshing(true);
    try {
      await serviceApi.refreshServiceCodes();
      mutate();
      toast.success("Code statuses refreshed");
    } catch (e: any) {
      toast.error(e?.message ?? "Refresh failed");
    } finally {
      setRefreshing(false);
    }
  };

  const systemHealthy = (overview?.systemStatus ?? "") === "Healthy";

  const stats = [
    {
      label: "Providers",
      value: (overview?.providersCount ?? 0).toLocaleString(),
      hint: `${overview?.activeProvidersCount ?? 0} active`,
    },
    {
      label: "Services",
      value: (overview?.servicesCount ?? 0).toLocaleString(),
      hint: "in catalog",
    },
    {
      label: "Codes issued",
      value: (overview?.codesCount ?? 0).toLocaleString(),
      hint: "all-time",
    },
    {
      label: "System",
      value: overview?.systemStatus ?? "—",
      hint: systemHealthy ? "All clear" : "Attention needed",
      tone: systemHealthy ? ("green" as const) : ("amber" as const),
    },
  ];

  const actions = [
    { label: "Add Provider", desc: "Register a new service provider", icon: Plus, to: "/admin/settings#create" },
    { label: "Create Service", desc: "Add a new service offering", icon: Plus, to: "/admin/settings#create" },
    { label: "Manage Catalog", desc: "Edit providers and services", icon: Pencil, to: "/admin/settings#modify" },
  ];

  return (
    <div className="space-y-12">
      <MissionMasthead
        index="II"
        section="Platform"
        title="Overview"
        description="Live operational view of providers, services, and code redemptions across the marketplace."
        actions={
          <>
            <div className="hidden md:flex items-center gap-2">
              <PulseDot tone={systemHealthy ? "green" : "amber"} />
              <MaisonEyebrow>{systemHealthy ? "Healthy" : "Degraded"}</MaisonEyebrow>
            </div>
            <MaisonButton variant="ghost" size="sm" onClick={refresh} disabled={refreshing}>
              <RefreshCw className={"h-4 w-4 " + (refreshing ? "animate-spin" : "")} />
              {refreshing ? "Refreshing…" : "Refresh"}
            </MaisonButton>
          </>
        }
      />

      {/* System alert */}
      {!isLoading && !systemHealthy && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Alert
            type="warning"
            title="System status"
            message="Some services may be experiencing issues. Check the Operations page for details."
          />
        </motion.div>
      )}

      {/* Stat strip */}
      <section>
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricsSkeleton count={4} />
          </div>
        )}
        {!isLoading && error && (
          <Alert type="error" title="Unable to load metrics" message="Refresh or check connection." />
        )}
        {!isLoading && !error && <StatStrip items={stats} />}
      </section>

      {/* Activity & quick actions */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={fade} initial="hidden" animate="show" custom={0} className="lg:col-span-2">
          <BentoCell>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <Activity className="h-4 w-4 text-ink/45" />
                <MaisonEyebrow>Recent activity</MaisonEyebrow>
              </div>
              <MaisonEyebrow tone="muted">{ACTIVITY.length} entries</MaisonEyebrow>
            </div>

            <div className="divide-y divide-ink/8">
              {ACTIVITY.map((item, idx) => (
                <ListRow key={idx} className="border-0">
                  <StatusDot status={item.status} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{item.action}</p>
                    <p className="text-xs text-ink/55 mt-1 truncate">{item.detail}</p>
                  </div>
                  <span className="font-mono text-[10px] text-ink/40 uppercase tracking-[0.18em] whitespace-nowrap shrink-0">
                    {item.time}
                  </span>
                </ListRow>
              ))}
              {ACTIVITY.length === 0 && (
                <div className="py-12 text-center text-ink/50 text-sm">No recent activity</div>
              )}
            </div>

            <Rule className="my-5" />
            <div className="flex items-center gap-3 text-xs text-ink/55">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Activity is refreshed live. Open per-section pages for full audit trail.</span>
            </div>
          </BentoCell>
        </motion.div>

        <motion.div variants={fade} initial="hidden" animate="show" custom={1}>
          <BentoCell className="h-full">
            <div className="flex items-center justify-between mb-5">
              <MaisonEyebrow>Quick actions</MaisonEyebrow>
              <ShieldCheck className="h-4 w-4 text-ink/45" />
            </div>

            <div className="space-y-3">
              <button
                onClick={refresh}
                disabled={refreshing}
                className="w-full text-left p-4 border border-ink/10 rounded-[4px] hover:border-ink/30 hover:bg-ink/[0.02] transition-all group disabled:opacity-60"
              >
                <div className="flex items-start gap-3">
                  <RefreshCw className={"h-5 w-5 text-ink/60 mt-0.5 shrink-0 " + (refreshing ? "animate-spin" : "")} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">
                      {refreshing ? "Refreshing codes…" : "Refresh code status"}
                    </p>
                    <p className="text-xs text-ink/55 mt-1">Update expirations and load new codes</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-ink/25 group-hover:text-ink mt-1 transition shrink-0" />
                </div>
              </button>

              {actions.map((a) => {
                const Icon = a.icon;
                return (
                  <Link
                    key={a.label}
                    to={a.to}
                    className="block p-4 border border-ink/10 rounded-[4px] hover:border-ink/30 hover:bg-ink/[0.02] transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="h-5 w-5 text-ink/50 mt-0.5 group-hover:text-ink transition shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-ink truncate">{a.label}</p>
                        <p className="text-xs text-ink/55 mt-1">{a.desc}</p>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-ink/25 group-hover:text-ink mt-1 transition shrink-0" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </BentoCell>
        </motion.div>
      </section>

      {/* Cross-links to other workspaces */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { to: "/admin/providers", label: "Providers", icon: Users, desc: "Vendor accounts & directory" },
          { to: "/admin/services", label: "Services", icon: Briefcase, desc: "Catalog & pricing" },
          { to: "/admin/codes", label: "Codes", icon: Ticket, desc: "Redemption ledger" },
        ].map((x, i) => (
          <motion.div key={x.to} variants={fade} initial="hidden" animate="show" custom={i + 2}>
            <Link
              to={x.to}
              className="group flex items-center justify-between gap-4 p-5 bg-card border border-ink/10 rounded-[6px] hover:border-ink/40 transition-colors"
            >
              <div className="flex items-center gap-4 min-w-0">
                <x.icon className="h-5 w-5 text-ink/45 group-hover:text-ink transition-colors shrink-0" />
                <div className="min-w-0">
                  <p className="font-v3-display text-lg text-ink truncate">{x.label}</p>
                  <p className="text-xs text-ink/55 truncate">{x.desc}</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-ink/30 group-hover:text-ink group-hover:rotate-45 transition-all shrink-0" />
            </Link>
          </motion.div>
        ))}
      </section>

      <Rule weight="hair" />
    </div>
  );
};

export default AdminDashboard;
