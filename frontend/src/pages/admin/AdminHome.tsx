import { useMemo } from "react";
import { motion } from "framer-motion";
import useSWR from "swr";
import {
  Users,
  Briefcase,
  Ticket,
  MessageSquare,
  ClipboardList,
  Settings,
  LayoutDashboard,
  TrendingUp,
  Activity,
} from "lucide-react";

import { MaisonEyebrow, Rule, MonoTag } from "@/components/admin/AdminMaison";
import {
  HubMasthead,
  HubTile,
  BentoCell,
  PulseDot,
  KeyHint,
} from "@/components/admin/AdminMaisonPlus";

// Adjust this import path to match where your project exports these APIs.
import {
  serviceApi,
  adminApi,
  type ServiceCode,
  type Service,
} from "@/lib/api/";

/* ─────────────────────────────────────────────────────────────
 * AdminHome — "Mission Control" hub.
 *
 * No sidebar; this page IS the navigation surface. A bento of
 * editorial hub tiles with live signal counts replaces the
 * traditional menu. The Radial Action Hub in AdminLayout provides
 * one-gesture jumping; ⌘K covers keyboard-first navigation.
 * ───────────────────────────────────────────────────────────── */

const fade = {
  hidden: { opacity: 0, y: 12 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: 0.05 + i * 0.05, ease: [0.2, 0.7, 0.2, 1] as const },
  }),
};

const greeting = () => {
  const h = new Date().getHours();
  if (h < 5) return "Late hours";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good night";
};

const codesFetcher = () => serviceApi.getServiceCodes().then((r) => r.data);
const servicesFetcher = () => serviceApi.getAllServicesAdmin().then((r) => r.data);
const messagesFetcher = () => adminApi.getContactMessages().then((r) => r.data ?? []);
// Best-effort — if your admin API exposes these, they'll fill in;
// otherwise the tiles fall back gracefully to em-dash.
const providersFetcher = async () => {
  // @ts-expect-error — optional surface
  const r = adminApi.getProviders ? await adminApi.getProviders() : { data: [] };
  return r.data ?? [];
};
const requestsFetcher = async () => {
  const r = adminApi.getListingRequests ? await adminApi.getListingRequests() : { data: [] };
  return r.data ?? [];
};

const AdminHome = () => {
  const { data: codes = [] as ServiceCode[] } = useSWR("/admin/codes", codesFetcher);
  const { data: services = [] as Service[] } = useSWR("/admin/services", servicesFetcher);
  const { data: messages = [] as any[] } = useSWR("/admin/contact-messages", messagesFetcher);
  const { data: providers = [] as any[] } = useSWR("/admin/providers", providersFetcher);
  const { data: requests = [] as any[] } = useSWR("/admin/vendor-requests", requestsFetcher);

  const stats = useMemo(() => {
    const activeCodes = codes.filter((c: any) => c.status === "active").length;
    const unreadMessages = messages.filter(
      (m: any) => m.status === "pending" || m.status === "unread",
    ).length;
    const pendingRequests = requests.filter((r: any) => r.status === "pending").length;
    return { activeCodes, unreadMessages, pendingRequests };
  }, [codes, messages, requests]);

  return (
    <div className="space-y-12">
      {/* Masthead */}
      <HubMasthead
        greeting={greeting() + " · Mission Control"}
        title="Run the floor."
        subtitle="Every surface of the platform — providers, services, redemption codes, customer signals — one keystroke away. Press ⌘K to jump anywhere, or tap the orb."
        right={
          <div className="hidden md:flex items-center gap-3">
            <PulseDot tone="green" />
            <MaisonEyebrow>All systems nominal</MaisonEyebrow>
            <span className="h-4 w-px bg-ink/15 mx-2" />
            <KeyHint>⌘K</KeyHint>
          </div>
        }
      />

      {/* Primary hub bento */}
      <section>
        <div className="flex items-center justify-between gap-4 mb-5">
          <MaisonEyebrow>I · Workspaces</MaisonEyebrow>
          <MaisonEyebrow tone="muted">Tap to enter</MaisonEyebrow>
        </div>

        <motion.div
          variants={fade}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-5 auto-rows-[minmax(220px,auto)]"
        >
          <motion.div variants={fade} custom={0} className="md:col-span-2 md:row-span-2">
            <HubTile
              to="/admin/dashboard"
              index="01"
              eyebrow="Overview"
              title="The platform, at a glance."
              description="Revenue, redemptions, and provider health — live."
              icon={LayoutDashboard}
              metric={stats.activeCodes.toLocaleString()}
              metricLabel="Active codes today"
              accent
              span="hero"
              className="h-full"
            />
          </motion.div>

          <motion.div variants={fade} custom={1}>
            <HubTile
              to="/admin/providers"
              index="02"
              eyebrow="Vendors"
              title="Providers"
              description="Approved storefronts and onboarding pipeline."
              icon={Users}
              metric={providers.length || "—"}
              metricLabel="Total providers"
            />
          </motion.div>

          <motion.div variants={fade} custom={2}>
            <HubTile
              to="/admin/services"
              index="03"
              eyebrow="Catalog"
              title="Services"
              description="Live, draft, and retired listings across the marketplace."
              icon={Briefcase}
              metric={services.length}
              metricLabel="Published services"
            />
          </motion.div>

          <motion.div variants={fade} custom={3}>
            <HubTile
              to="/admin/codes"
              index="04"
              eyebrow="Redemptions"
              title="Codes"
              description="Issued, active, redeemed, expired — full ledger."
              icon={Ticket}
              metric={codes.length.toLocaleString()}
              metricLabel="Total codes issued"
            />
          </motion.div>

          <motion.div variants={fade} custom={4}>
            <HubTile
              to="/admin/messages"
              index="05"
              eyebrow="Inbox"
              title="Messages"
              description="Direct customer contact, awaiting triage."
              icon={MessageSquare}
              metric={stats.unreadMessages || "0"}
              metricLabel={stats.unreadMessages === 1 ? "Unread" : "Unread"}
            />
          </motion.div>

          <motion.div variants={fade} custom={5}>
            <HubTile
              to="/admin/vendor-requests"
              index="06"
              eyebrow="Petitions"
              title="Listing requests"
              description="Vendors petitioning to list a new service."
              icon={ClipboardList}
              metric={stats.pendingRequests || "0"}
              metricLabel="Awaiting review"
            />
          </motion.div>
        </motion.div>
      </section>

      <Rule weight="hair" />

      {/* Secondary band: ops + live activity */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <BentoCell className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <Activity className="h-4 w-4 text-ink/45" />
              <MaisonEyebrow>Today · Signals</MaisonEyebrow>
            </div>
            <MonoTag tone="green">Live</MonoTag>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <SignalStat label="Active codes" value={stats.activeCodes} accent />
            <SignalStat
              label="Pending petitions"
              value={stats.pendingRequests}
              tone={stats.pendingRequests > 0 ? "amber" : undefined}
            />
            <SignalStat
              label="Unread messages"
              value={stats.unreadMessages}
              tone={stats.unreadMessages > 0 ? "amber" : undefined}
            />
          </div>

          <Rule className="my-6" />

          <div className="flex items-center gap-3 text-xs text-ink/55">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>
              Data refreshes automatically. Open{" "}
              <span className="text-ink underline underline-offset-4 decoration-ink/30">
                Overview
              </span>{" "}
              for full analytics.
            </span>
          </div>
        </BentoCell>

        <BentoCell>
          <div className="flex items-center justify-between mb-5">
            <MaisonEyebrow>Operations</MaisonEyebrow>
            <Settings className="h-4 w-4 text-ink/45" />
          </div>
          <h3 className="font-v3-display text-2xl tracking-[-0.01em] mb-2">
            Platform settings
          </h3>
          <p className="text-sm text-ink/55 mb-6">
            Branding, fees, payout rails, and admin accounts.
          </p>
          <a
            href="/admin/settings"
            className="inline-flex items-center gap-2 font-mono uppercase text-[11px] tracking-[0.18em] text-ink border-b border-ink/30 pb-0.5 hover:border-ink transition-colors"
          >
            Configure
          </a>
        </BentoCell>
      </section>

      {/* Keyboard cheat sheet */}
      <section className="rounded-[6px] border border-dashed border-ink/15 p-6 flex flex-wrap items-center gap-x-8 gap-y-3">
        <MaisonEyebrow>Shortcuts</MaisonEyebrow>
        <ShortcutRow keys={["⌘", "K"]} label="Command palette" />
        <ShortcutRow keys={["Esc"]} label="Dismiss overlays" />
        <ShortcutRow keys={["+"]} label="Open radial hub" hint="(bottom-right)" />
      </section>
    </div>
  );
};

const SignalStat = ({
  label,
  value,
  accent,
  tone,
}: {
  label: string;
  value: number;
  accent?: boolean;
  tone?: "amber" | "red";
}) => (
  <div>
    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/45 mb-3">
      {label}
    </p>
    <p
      className={
        "font-v3-display text-4xl md:text-5xl tracking-[-0.02em] leading-none " +
        (accent
          ? "text-ink"
          : tone === "amber"
            ? "text-amber-600"
            : tone === "red"
              ? "text-red-600"
              : "text-ink")
      }
    >
      {value.toLocaleString()}
    </p>
  </div>
);

const ShortcutRow = ({
  keys,
  label,
  hint,
}: {
  keys: string[];
  label: string;
  hint?: string;
}) => (
  <div className="flex items-center gap-3">
    <span className="flex items-center gap-1">
      {keys.map((k) => (
        <KeyHint key={k}>{k}</KeyHint>
      ))}
    </span>
    <span className="text-xs text-ink/65">{label}</span>
    {hint && <span className="text-[11px] text-ink/40">{hint}</span>}
  </div>
);

export default AdminHome;
