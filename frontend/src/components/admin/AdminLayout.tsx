import { useEffect, useMemo, useState } from "react";
import {
  Link,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut,
  Loader2,
  LayoutDashboard,
  Users,
  Briefcase,
  Ticket,
  Settings,
  MessageSquare,
  ClipboardList,
  Home,
  Plus,
  Search,
  Command as CommandIcon,
  X,
  ArrowUpRight,
} from "lucide-react";

import { handleLogout } from "@/lib/auth/logoutHandler";
import FullPageLoader from "@/components/FullPageLoader";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AppLogo } from "@/components/app/SubformeLogo";
import { useRoleRedirect } from "@/hooks/useRoleRedirect";
import { MaisonEyebrow } from "./AdminMaison";

/* ─────────────────────────────────────────────────────────────
 * AdminLayout — Hub + Radial shell.
 *
 * Distinctive admin chrome:
 *   • Minimal top "mast" with editorial wordmark, contextual section
 *     pill (current page), live time, theme + profile cluster.
 *   • Bottom-right Radial Action Hub — a single primary orb that
 *     fans out into navigation + quick actions in an arc, replacing
 *     the conventional sidebar entirely.
 *   • ⌘K Command Palette as the keyboard surface.
 *
 * No sidebar. No bottom tab bar. Composition gives every page the
 * full viewport while keeping navigation one gesture / keystroke away.
 * ───────────────────────────────────────────────────────────── */

export type AdminNavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  group: "platform" | "support";
  hint?: string;
  end?: boolean;
};

export const ADMIN_NAV: AdminNavItem[] = [
  { to: "/admin", label: "Hub", icon: Home, group: "platform", end: true, hint: "Mission control" },
  { to: "/admin/dashboard", label: "Overview", icon: LayoutDashboard, group: "platform", hint: "Live metrics" },
  { to: "/admin/providers", label: "Providers", icon: Users, group: "platform", hint: "Vendor accounts" },
  { to: "/admin/services", label: "Services", icon: Briefcase, group: "platform", hint: "Catalog" },
  { to: "/admin/codes", label: "Codes", icon: Ticket, group: "platform", hint: "Redemptions" },
  { to: "/admin/messages", label: "Messages", icon: MessageSquare, group: "support", hint: "Contact inbox" },
  { to: "/admin/vendor-requests", label: "Petitions", icon: ClipboardList, group: "support", hint: "Listing requests" },
  { to: "/admin/settings", label: "Operations", icon: Settings, group: "support", hint: "Platform config" },
];

const ADMIN_USER = {
  name: "Dev User",
  role: "Super Admin" as const,
  state: "Lagos",
};

// ───────────────────────── helpers ─────────────────────────

const useNow = () => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);
  return now;
};

const matchNavItem = (pathname: string): AdminNavItem | undefined => {
  // Most-specific first.
  const sorted = [...ADMIN_NAV].sort((a, b) => b.to.length - a.to.length);
  return sorted.find((n) =>
    n.end ? pathname === n.to : pathname === n.to || pathname.startsWith(n.to + "/"),
  );
};

// ───────────────────────── top mast ─────────────────────────

const TopMast = ({
  current,
  onOpenPalette,
}: {
  current?: AdminNavItem;
  onOpenPalette: () => void;
}) => {
  const now = useNow();
  const date = now.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
  const time = now.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-paper/80 border-b border-ink/10">
      <div className="mx-auto max-w-[1600px] px-6 lg:px-10 h-16 flex items-center gap-6">
        {/* Wordmark */}
        <Link to="/admin" className="flex items-center gap-3 min-w-0 shrink-0">
          <AppLogo />
          <span className="hidden sm:inline-block font-v3-display text-lg tracking-[-0.01em] text-ink">
            Admin
          </span>
        </Link>

        {/* Section pill — current location */}
        <div className="hidden md:flex items-center gap-3 min-w-0">
          <span className="h-4 w-px bg-ink/15" />
          <MaisonEyebrow>{current?.group === "support" ? "Support" : "Platform"}</MaisonEyebrow>
          <span className="font-v3-display text-base text-ink truncate">
            {current?.label ?? "Hub"}
          </span>
        </div>

        <div className="flex-1" />

        {/* Command launcher */}
        <button
          onClick={onOpenPalette}
          className="group hidden md:inline-flex items-center gap-3 px-3 py-1.5 border border-ink/15 rounded-full hover:border-ink/40 transition-colors"
          aria-label="Open command palette"
        >
          <Search className="h-3.5 w-3.5 text-ink/55" />
          <span className="text-xs text-ink/55 group-hover:text-ink transition-colors">
            Jump to anywhere
          </span>
          <kbd className="font-mono text-[10px] tracking-[0.14em] px-1.5 py-0.5 border border-ink/15 rounded text-ink/55">
            ⌘K
          </kbd>
        </button>

        {/* Live mast meta */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="flex flex-col items-end leading-tight">
            <MaisonEyebrow>{date}</MaisonEyebrow>
            <span className="font-mono text-xs text-ink tracking-[0.08em]">{time}</span>
          </div>
          <ThemeToggle variant="icon" />
        </div>

        {/* Mobile palette */}
        <button
          onClick={onOpenPalette}
          className="md:hidden p-2 border border-ink/15 rounded-full"
          aria-label="Open command palette"
        >
          <Search className="h-4 w-4 text-ink" />
        </button>
      </div>
    </header>
  );
};

// ───────────────────────── radial hub ─────────────────────────

type RadialAction = {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onSelect: () => void;
  tone?: "ink" | "danger";
};

const RadialHub = ({
  actions,
  open,
  onToggle,
}: {
  actions: RadialAction[];
  open: boolean;
  onToggle: () => void;
}) => {
  // Fan the actions out in a quarter-arc that grows from the orb.
  const count = actions.length;
  const arcStart = 180; // points left
  const arcEnd = 270; // points up
  const radius = 132;

  const positions = useMemo(
    () =>
      actions.map((_, i) => {
        const t = count === 1 ? 0.5 : i / (count - 1);
        const angle = arcStart + (arcEnd - arcStart) * t;
        const rad = (angle * Math.PI) / 180;
        return {
          x: Math.cos(rad) * radius,
          y: Math.sin(rad) * radius,
        };
      }),
    [count, actions],
  );

  return (
    <div className="fixed bottom-8 right-8 z-40 print:hidden">
      {/* Action satellites */}
      <AnimatePresence>
        {open && (
          <>
            {/* Background scrim — soft, doesn't darken content much */}
            <motion.button
              key="scrim"
              type="button"
              aria-label="Close radial menu"
              onClick={onToggle}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-paper/55 backdrop-blur-[2px] -z-10 cursor-default"
            />

            {actions.map((a, i) => {
              const Icon = a.icon;
              const pos = positions[i];
              return (
                <motion.button
                  key={a.key}
                  type="button"
                  onClick={() => {
                    a.onSelect();
                    onToggle();
                  }}
                  initial={{ x: 0, y: 0, opacity: 0, scale: 0.6 }}
                  animate={{ x: pos.x, y: pos.y, opacity: 1, scale: 1 }}
                  exit={{ x: 0, y: 0, opacity: 0, scale: 0.6 }}
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 28,
                    delay: i * 0.025,
                  }}
                  className={cn(
                    "absolute bottom-0 right-0 group flex flex-col items-center gap-2",
                  )}
                  style={{ width: 64, height: 64 }}
                >
                  <span
                    className={cn(
                      "h-12 w-12 rounded-full flex items-center justify-center border transition-colors shadow-[0_8px_24px_-12px_rgba(0,0,0,0.25)]",
                      a.tone === "danger"
                        ? "bg-paper text-red-600 border-red-300 hover:bg-red-600 hover:text-paper hover:border-red-600"
                        : "bg-paper text-ink border-ink/15 hover:bg-ink hover:text-paper hover:border-ink",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  {/* <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink/70 whitespace-nowrap">
                    {a.label}
                  </span> */}
                </motion.button>
              );
            })}
          </>
        )}
      </AnimatePresence>

      {/* The orb */}
      <motion.button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-label={open ? "Close action hub" : "Open action hub"}
        whileTap={{ scale: 0.94 }}
        animate={{ rotate: open ? 45 : 0 }}
        transition={{ type: "spring", stiffness: 360, damping: 24 }}
        className={cn(
          "relative h-16 w-16 rounded-full flex items-center justify-center",
          "bg-ink text-paper shadow-[0_18px_36px_-12px_rgba(0,0,0,0.45)]",
          "border border-ink hover:bg-ink/90",
        )}
      >
        <Plus className="h-7 w-7" strokeWidth={1.5} />
        {!open && (
          <span className="absolute inset-0 rounded-full ring-1 ring-ink/20 animate-[ping_2.4s_ease-out_infinite] pointer-events-none" />
        )}
      </motion.button>
    </div>
  );
};

// ───────────────────────── command palette ─────────────────────────

const CommandPalette = ({
  open,
  onClose,
  onNavigate,
}: {
  open: boolean;
  onClose: () => void;
  onNavigate: (to: string) => void;
}) => {
  const [q, setQ] = useState("");
  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  const items = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return ADMIN_NAV;
    return ADMIN_NAV.filter((n) =>
      [n.label, n.hint ?? "", n.to].some((s) => s.toLowerCase().includes(needle)),
    );
  }, [q]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[14vh] px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            aria-label="Close"
            onClick={onClose}
            className="absolute inset-0 bg-ink/40 backdrop-blur-[3px]"
          />
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="relative w-full max-w-xl bg-paper border border-ink/15 rounded-2xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.4)] overflow-hidden"
          >
            <div className="flex items-center gap-3 px-5 py-4 border-b border-ink/10">
              <CommandIcon className="h-4 w-4 text-ink/45" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search providers, services, settings…"
                className="flex-1 bg-transparent text-sm placeholder:text-ink/35 focus:outline-none text-ink"
              />
              <kbd className="font-mono text-[10px] tracking-[0.14em] px-1.5 py-0.5 border border-ink/15 rounded text-ink/55">
                Esc
              </kbd>
            </div>
            <ul className="max-h-[55vh] overflow-y-auto py-2">
              {items.length === 0 && (
                <li className="px-5 py-8 text-center text-sm text-ink/45">
                  Nothing matches “{q}”.
                </li>
              )}
              {items.map((n) => {
                const Icon = n.icon;
                return (
                  <li key={n.to}>
                    <button
                      type="button"
                      onClick={() => {
                        onNavigate(n.to);
                        onClose();
                      }}
                      className="w-full flex items-center gap-4 px-5 py-3 hover:bg-ink/[0.04] transition-colors text-left"
                    >
                      <span className="h-9 w-9 rounded-lg bg-ink/5 flex items-center justify-center text-ink/70">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm text-ink truncate">{n.label}</span>
                        <span className="block text-xs text-ink/50 truncate">{n.hint}</span>
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-ink/30" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ───────────────────────── shell ─────────────────────────

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [hubOpen, setHubOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const { isLoading, isError, role } = useRoleRedirect("/admin", false);

  // Keyboard: ⌘K / Ctrl+K toggles palette, Esc closes overlays.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
        setHubOpen(false);
      } else if (e.key === "Escape") {
        setPaletteOpen(false);
        setHubOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Close hub on route change.
  useEffect(() => {
    setHubOpen(false);
  }, [location.pathname]);

  if (isLoading) return <FullPageLoader text="Authenticating…" />;
  if (isError || !role) return <Navigate to="/admin/login" replace />;

  const current = matchNavItem(location.pathname);

  const handleLogoutClick = () => handleLogout(setIsLoggingOut, navigate);

  // Radial action set: 6 destinations + sign-out.
  const radialActions: RadialAction[] = [
    { key: "hub", label: "Hub", icon: Home, onSelect: () => navigate("/admin") },
    { key: "overview", label: "Overview", icon: LayoutDashboard, onSelect: () => navigate("/admin/dashboard") },
    { key: "providers", label: "Providers", icon: Users, onSelect: () => navigate("/admin/providers") },
    { key: "services", label: "Services", icon: Briefcase, onSelect: () => navigate("/admin/services") },
    { key: "codes", label: "Codes", icon: Ticket, onSelect: () => navigate("/admin/codes") },
    { key: "inbox", label: "Inbox", icon: MessageSquare, onSelect: () => navigate("/admin/messages") },
    {
      key: "logout",
      label: isLoggingOut ? "Signing…" : "Sign out",
      icon: isLoggingOut ? Loader2 : LogOut,
      onSelect: handleLogoutClick,
      tone: "danger",
    },
  ];

  return (
    <div className="min-h-screen bg-paper text-ink font-v3 flex flex-col">
      <TopMast current={current} onOpenPalette={() => setPaletteOpen(true)} />

      <main className="flex-1 w-full">
        <div className="mx-auto max-w-[1600px] px-6 lg:px-10 py-8 md:py-12 pb-32">
          <Outlet />
        </div>
      </main>

      <RadialHub
        actions={radialActions}
        open={hubOpen}
        onToggle={() => setHubOpen((v) => !v)}
      />

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onNavigate={(to) => navigate(to)}
      />
    </div>
  );
};

export default AdminLayout;
