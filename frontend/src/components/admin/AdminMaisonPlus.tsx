import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, ChevronRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { MaisonEyebrow, Rule } from "./AdminMaison";

/* ─────────────────────────────────────────────────────────────
 * AdminMaisonPlus — extra primitives for the Hub paradigm.
 * Augments AdminMaison (does not replace).
 * ───────────────────────────────────────────────────────────── */

// ─── HubTile ──────────────────────────────────────────────
export const HubTile = ({
  to,
  index,
  eyebrow,
  title,
  description,
  metric,
  metricLabel,
  icon: Icon,
  accent,
  className,
  span = "default",
}: {
  to: string;
  index: string;
  eyebrow: string;
  title: string;
  description?: string;
  metric?: ReactNode;
  metricLabel?: string;
  icon: LucideIcon;
  accent?: boolean;
  className?: string;
  span?: "default" | "wide" | "tall" | "hero";
}) => (
  <Link
    to={to}
    className={cn(
      "group relative flex flex-col justify-between overflow-hidden",
      "bg-card border border-ink/10 rounded-[6px] p-6 lg:p-7",
      "transition-all duration-300 hover:border-ink/40 hover:-translate-y-0.5",
      "hover:shadow-[0_18px_36px_-22px_rgba(0,0,0,0.35)]",
      span === "wide" && "md:col-span-2",
      span === "tall" && "md:row-span-2",
      span === "hero" && "md:col-span-2 md:row-span-2",
      accent && "bg-ink text-paper border-ink hover:bg-ink/95",
      className,
    )}
  >
    <div className="flex items-start justify-between gap-4 mb-10">
      <span
        className={cn(
          "font-mono text-[10px] uppercase tracking-[0.22em]",
          accent ? "text-paper/55" : "text-ink/40",
        )}
      >
        {index} · {eyebrow}
      </span>
      <span
        className={cn(
          "h-9 w-9 rounded-full flex items-center justify-center border transition-transform group-hover:rotate-45",
          accent
            ? "border-paper/30 text-paper"
            : "border-ink/15 text-ink/60 group-hover:border-ink group-hover:text-ink",
        )}
      >
        <ArrowUpRight className="h-4 w-4" />
      </span>
    </div>

    <div className="flex-1">
      <h3
        className={cn(
          "font-v3-display tracking-[-0.01em] leading-[1.02]",
          "text-3xl md:text-[34px] mb-3",
          accent ? "text-paper" : "text-ink",
        )}
      >
        {title}
      </h3>
      {description && (
        <p className={cn("text-sm max-w-md leading-relaxed", accent ? "text-paper/65" : "text-ink/55")}>
          {description}
        </p>
      )}
    </div>

    <div className="mt-8 flex items-end justify-between gap-4">
      <div className="min-w-0">
        {metric !== undefined && (
          <div
            className={cn(
              "font-v3-display text-3xl md:text-4xl tracking-[-0.02em] leading-none",
              accent ? "text-paper" : "text-ink",
            )}
          >
            {metric}
          </div>
        )}
        {metricLabel && (
          <div
            className={cn(
              "mt-2 font-mono text-[10px] uppercase tracking-[0.18em]",
              accent ? "text-paper/55" : "text-ink/45",
            )}
          >
            {metricLabel}
          </div>
        )}
      </div>
      <Icon
        className={cn(
          "h-10 w-10 shrink-0 stroke-[1.25]",
          accent ? "text-paper/70" : "text-ink/30 group-hover:text-ink/60 transition-colors",
        )}
      />
    </div>
  </Link>
);

// ─── BentoCell ───
export const BentoCell = ({
  children,
  className,
  span = "default",
}: {
  children: ReactNode;
  className?: string;
  span?: "default" | "wide" | "tall" | "hero";
}) => (
  <div
    className={cn(
      "bg-card border border-ink/10 rounded-[6px] p-6 transition-colors hover:border-ink/20",
      span === "wide" && "md:col-span-2",
      span === "tall" && "md:row-span-2",
      span === "hero" && "md:col-span-2 md:row-span-2",
      className,
    )}
  >
    {children}
  </div>
);

// ─── KeyHint ───
export const KeyHint = ({ children, className }: { children: ReactNode; className?: string }) => (
  <kbd
    className={cn(
      "font-mono text-[10px] tracking-[0.14em] px-1.5 py-0.5 border border-ink/15 rounded text-ink/55",
      className,
    )}
  >
    {children}
  </kbd>
);

// ─── PulseDot ───
export const PulseDot = ({
  tone = "green",
  className,
}: {
  tone?: "green" | "amber" | "red" | "ink";
  className?: string;
}) => {
  const map = { green: "bg-green-500", amber: "bg-amber-500", red: "bg-red-500", ink: "bg-ink" };
  return (
    <span className={cn("relative inline-flex h-2 w-2", className)}>
      <span className={cn("absolute inset-0 rounded-full opacity-60 animate-ping", map[tone])} />
      <span className={cn("relative inline-block h-2 w-2 rounded-full", map[tone])} />
    </span>
  );
};

// ─── HubMasthead — display-size hub header ───
export const HubMasthead = ({
  greeting,
  title,
  subtitle,
  right,
}: {
  greeting?: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) => (
  <header className="pb-10">
    <div className="flex items-center justify-between gap-4 mb-6">
      <MaisonEyebrow>{greeting ?? "Mission Control"}</MaisonEyebrow>
      {right}
    </div>
    <motion.h1
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
      className="font-v3-display text-[56px] md:text-[88px] leading-[0.92] tracking-[-0.03em] text-ink"
    >
      {title}
    </motion.h1>
    {subtitle && (
      <p className="mt-4 max-w-xl text-sm md:text-base text-ink/55 leading-relaxed">
        {subtitle}
      </p>
    )}
    <Rule weight="bold" className="mt-8" />
  </header>
);

/* ─────────────────────────────────────────────────────────────
 * Page primitives used across upgraded admin pages.
 * ───────────────────────────────────────────────────────────── */

// ─── MissionMasthead — page-level header with breadcrumb, index, actions ───
export const MissionMasthead = ({
  index,
  section,
  title,
  description,
  actions,
}: {
  index: string;
  section: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) => (
  <header className="pb-8">
    <nav className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-ink/45 mb-5">
      <Link to="/admin" className="hover:text-ink transition-colors">Hub</Link>
      <ChevronRight className="h-3 w-3" />
      <span>{section}</span>
      <ChevronRight className="h-3 w-3" />
      <span className="text-ink">{title}</span>
    </nav>

    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-6">
      <div className="min-w-0">
        <div className="flex items-baseline gap-4 mb-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/35 shrink-0">
            {index}
          </span>
          <span className="h-px flex-1 bg-ink/15" />
        </div>
        <h1 className="font-v3-display text-[40px] md:text-[64px] leading-[0.95] tracking-[-0.025em] text-ink">
          {title}
        </h1>
        {description && (
          <p className="mt-4 text-sm md:text-base text-ink/55 max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="shrink-0 flex items-center gap-3">{actions}</div>}
    </div>

    <Rule weight="bold" className="mt-8" />
  </header>
);

// ─── StatStrip — editorial horizontal metrics ───
export type StatStripItem = {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "default" | "amber" | "red" | "green";
};

export const StatStrip = ({ items, className }: { items: StatStripItem[]; className?: string }) => (
  <div
    className={cn(
      "grid divide-x divide-ink/10 border-y border-ink/15 bg-card rounded-[6px] overflow-hidden",
      "grid-cols-1 sm:grid-cols-2",
      items.length === 3 && "md:grid-cols-3",
      items.length === 4 && "md:grid-cols-2 lg:grid-cols-4",
      items.length >= 5 && "md:grid-cols-3 lg:grid-cols-5",
      className,
    )}
  >
    {items.map((s, i) => (
      <div key={i} className="px-6 py-6 flex flex-col gap-2 min-w-0">
        <MaisonEyebrow>{s.label}</MaisonEyebrow>
        <div
          className={cn(
            "font-v3-display text-[34px] md:text-[40px] tracking-[-0.02em] leading-none truncate",
            s.tone === "amber" && "text-amber-600",
            s.tone === "red" && "text-red-600",
            s.tone === "green" && "text-green-600",
            (!s.tone || s.tone === "default") && "text-ink",
          )}
        >
          {s.value}
        </div>
        {s.hint && (
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink/45">
            {s.hint}
          </p>
        )}
      </div>
    ))}
  </div>
);

// ─── FilterBar — search + filter slot, sticky-ready ───
export const FilterBar = ({
  children,
  right,
  className,
}: {
  children: ReactNode;
  right?: ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "flex flex-col gap-4 md:flex-row md:items-center md:justify-between",
      "bg-card border border-ink/10 rounded-[6px] px-5 py-4",
      className,
    )}
  >
    <div className="flex-1 min-w-0">{children}</div>
    {right && <div className="shrink-0 flex items-center gap-3">{right}</div>}
  </div>
);

// ─── TableSurface — wraps DataTable with a refined frame ───
export const TableSurface = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={cn(
      "bg-card border border-ink/10 rounded-[6px] overflow-hidden",
      "shadow-[0_1px_0_0_rgba(0,0,0,0.02),0_12px_28px_-22px_rgba(0,0,0,0.18)]",
      className,
    )}
  >
    {children}
  </motion.div>
);

// ─── SegmentToggle — small two-state toggle (table / cards) ───
export const SegmentToggle = <T extends string>({
  value,
  options,
  onChange,
  className,
}: {
  value: T;
  options: { key: T; label: ReactNode }[];
  onChange: (v: T) => void;
  className?: string;
}) => (
  <div className={cn("inline-flex p-1 border border-ink/15 rounded-full bg-paper", className)}>
    {options.map((o) => (
      <button
        key={o.key}
        type="button"
        onClick={() => onChange(o.key)}
        className={cn(
          "px-3 py-1 text-[11px] font-mono uppercase tracking-[0.14em] rounded-full transition-colors",
          value === o.key ? "bg-ink text-paper" : "text-ink/55 hover:text-ink",
        )}
      >
        {o.label}
      </button>
    ))}
  </div>
);
