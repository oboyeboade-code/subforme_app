import { ReactNode, forwardRef, InputHTMLAttributes, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { ChevronDown, AlertCircle, CheckCircle, Info } from "lucide-react";

/* ─────────────────────────────────────────────────────────────
 * Admin Maison — Professional Executive Dashboard Primitives
 * Refined editorial language with enhanced data-driven components
 * ───────────────────────────────────────────────────────────── */

// ─── TYPOGRAPHY & UTILITIES ───

export const MaisonEyebrow = ({
  children,
  className,
  tone = "default",
}: {
  children: ReactNode;
  className?: string;
  tone?: "default" | "red" | "green" | "muted" | "blue" | "amber";
}) => (
  <span
    className={cn(
      "font-mono text-[10px] uppercase tracking-[0.22em]",
      tone === "default" && "text-ink/45",
      tone === "red" && "text-red-600",
      tone === "green" && "text-green-600",
      tone === "muted" && "text-ink/30",
      tone === "blue" && "text-blue-600",
      tone === "amber" && "text-amber-600",
      className,
    )}
  >
    {children}
  </span>
);

export const Rule = ({
  className,
  weight = "hair",
}: {
  className?: string;
  weight?: "hair" | "fine" | "bold";
}) => (
  <div
    className={cn(
      "w-full",
      weight === "hair" && "h-px bg-ink/10",
      weight === "fine" && "h-px bg-ink/20",
      weight === "bold" && "h-[2px] bg-ink",
      className,
    )}
  />
);

export const MonoTag = ({
  children,
  tone = "ink",
  className,
}: {
  children: ReactNode;
  tone?: "ink" | "red" | "green" | "muted" | "blue" | "amber";
  className?: string;
}) => {
  const tones: Record<string, string> = {
    ink: "text-ink border-ink/20 bg-ink/5",
    red: "text-red-700 border-red-200 bg-red-50",
    green: "text-green-700 border-green-200 bg-green-50",
    muted: "text-ink/55 border-ink/12 bg-ink/3",
    blue: "text-blue-700 border-blue-200 bg-blue-50",
    amber: "text-amber-700 border-amber-200 bg-amber-50",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] px-2.5 py-1 border rounded-[3px]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
};

// ─── PAGE STRUCTURE ───

export const Masthead = ({
  index,
  section,
  title,
  meta,
  rightSlot,
  className,
}: {
  index?: string;
  section?: string;
  title: string;
  meta?: ReactNode;
  rightSlot?: ReactNode;
  className?: string;
}) => {
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  return (
    <header className={cn("pb-8", className)}>
      <div className="flex items-center justify-between gap-4 mb-6">
        <MaisonEyebrow>
          {index ? `${index}` : "Subforme"} · {section ?? "Admin"}
        </MaisonEyebrow>
        <MaisonEyebrow className="hidden sm:inline-flex">{today}</MaisonEyebrow>
      </div>

      <Rule weight="bold" className="mb-6" />

      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <h1 className="font-v3-display text-[44px] md:text-[64px] leading-[0.95] tracking-[-0.02em] text-ink">
          {title}
        </h1>
        {rightSlot && <div className="shrink-0">{rightSlot}</div>}
      </div>

      {meta && (
        <p className="mt-4 text-sm text-ink/55 max-w-2xl leading-relaxed">
          {meta}
        </p>
      )}

      <Rule className="mt-8" />
    </header>
  );
};

export const PageHeader = ({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) => (
  <div className={cn("mb-8", className)}>
    <div className="flex items-start justify-between gap-4 mb-4">
      <div className="flex-1">
        <h1 className="text-3xl md:text-4xl font-semibold text-ink mb-2">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-ink/60">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
    <Rule />
  </div>
);

export const SectionHead = ({
  index,
  title,
  right,
  className,
}: {
  index?: string;
  title: string;
  right?: ReactNode;
  className?: string;
}) => (
  <div className={cn("mb-6", className)}>
    <div className="flex items-baseline justify-between gap-4">
      <div className="flex items-baseline gap-4 min-w-0">
        {index && (
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/35 shrink-0">
            {index}
          </span>
        )}
        <h2 className="font-v3-display text-2xl md:text-[28px] tracking-[-0.01em] truncate">
          {title}
        </h2>
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
    <Rule className="mt-3" />
  </div>
);

// ─── METRICS & CARDS ───

export const MetricBlock = ({
  label,
  value,
  hint,
  accent,
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  accent?: boolean;
  className?: string;
}) => (
  <div className={cn("flex flex-col gap-3 py-2", className)}>
    <MaisonEyebrow>{label}</MaisonEyebrow>
    <div
      className={cn(
        "font-v3-display leading-none tracking-[-0.02em] text-[44px] md:text-[56px]",
        accent ? "text-red-600" : "text-ink",
      )}
    >
      {value}
    </div>
    {hint && (
      <div className="text-xs text-ink/55 font-mono tracking-[0.04em]">
        {hint}
      </div>
    )}
  </div>
);

export const StatsCard = ({
  label,
  value,
  trend,
  trendDirection,
  className,
}: {
  label: string;
  value: string | number;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
  className?: string;
}) => (
  <div className={cn(
    "bg-white border border-ink/10 rounded-lg p-6 hover:border-ink/20 transition-colors",
    className
  )}>
    <div className="flex items-start justify-between mb-4">
      <p className="text-sm font-medium text-ink/60">{label}</p>
      {trend && (
        <span className={cn(
          "text-xs font-medium px-2 py-1 rounded",
          trendDirection === "up" && "text-green-700 bg-green-50",
          trendDirection === "down" && "text-red-700 bg-red-50",
          trendDirection === "neutral" && "text-ink/60 bg-ink/5",
        )}>
          {trend}
        </span>
      )}
    </div>
    <p className="text-3xl font-semibold text-ink">{value}</p>
  </div>
);

export const EditorialCard = ({
  children,
  className,
  interactive,
  ...rest
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  [k: string]: any;
}) => (
  <div
    className={cn(
      "bg-card border border-ink/10 rounded-[4px] transition-colors",
      interactive &&
        "cursor-pointer hover:border-ink/30 hover:bg-card/80",
      className,
    )}
    {...rest}
  >
    {children}
  </div>
);

// ─── LISTS & TABLES ───

export const ListRow = ({
  children,
  className,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) => (
  <div
    onClick={onClick}
    className={cn(
      "group flex items-center gap-4 py-5 border-b border-ink/8 last:border-b-0",
      onClick && "cursor-pointer hover:bg-ink/[0.015] -mx-3 px-3 transition-colors",
      className,
    )}
  >
    {children}
  </div>
);

interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  width?: string;
  render?: (row: T, index: number) => ReactNode;
  sortable?: boolean;
}

export const DataTable = <T extends Record<string, any>>({
  columns,
  data,
  isLoading,
  isEmpty,
  onRowClick,
  className,
}: {
  columns: TableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  isEmpty?: boolean;
  onRowClick?: (row: T) => void;
  className?: string;
}) => (
  <div className={cn("overflow-x-auto", className)}>
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-ink/10">
          {columns.map((col) => (
            <th
              key={String(col.key)}
              className={cn(
                "text-left py-3 px-4 font-semibold text-ink/70 text-xs uppercase tracking-wider",
                col.width
              )}
            >
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr
            key={idx}
            onClick={() => onRowClick?.(row)}
            className={cn(
              "border-b border-ink/5 hover:bg-ink/[0.02] transition-colors",
              onRowClick && "cursor-pointer"
            )}
          >
            {columns.map((col) => (
              <td key={String(col.key)} className="py-4 px-4">
                {col.render
                  ? col.render(row, idx)
                  : String(row[col.key as keyof T] ?? "—")}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
    {isEmpty && (
      <div className="py-12 text-center text-ink/50">
        <p className="text-sm">No data available</p>
      </div>
    )}
  </div>
);

// ─── BADGES & STATUS ───

export type StatusTone = "green" | "red" | "ink" | "muted" | "blue" | "amber";
export type StatusValue = "active" | "expired" | "used" | "unknown" | "pending" | "approved" | "rejected";

const statusMap: Record<StatusValue, StatusTone> = {
  active: "green",
  expired: "red",
  used: "ink",
  unknown: "muted",
  pending: "amber",
  approved: "green",
  rejected: "red",
};

export const StatusDot = ({
  status,
  tone,
  className,
}: {
  status?: StatusValue;
  tone?: StatusTone;
  className?: string;
}) => {
  const resolvedTone: StatusTone =
    tone ?? status ? statusMap[status as StatusValue] : "muted";

  const map: Record<StatusTone, string> = {
    green: "bg-green-500",
    red: "bg-red-500",
    ink: "bg-ink",
    muted: "bg-ink/30",
    blue: "bg-blue-500",
    amber: "bg-amber-500",
  };

  return (
    <span
      className={cn(
        "inline-block h-2 w-2 rounded-full",
        map[resolvedTone],
        className,
      )}
    />
  );
};

export const StatusBadge = ({
  status,
  tone,
  label,
  icon,
  className,
}: {
  status?: StatusValue;
  tone?: StatusTone;
  label: string;
  icon?: ReactNode;
  className?: string;
}) => {
  const resolvedTone: StatusTone =
    tone ?? status ? statusMap[status as StatusValue] : "muted";

  const tones: Record<StatusTone, string> = {
    green: "text-green-700 bg-green-50 border-green-200",
    red: "text-red-700 bg-red-50 border-red-200",
    ink: "text-ink bg-ink/5 border-ink/20",
    muted: "text-ink/60 bg-ink/3 border-ink/10",
    blue: "text-blue-700 bg-blue-50 border-blue-200",
    amber: "text-amber-700 bg-amber-50 border-amber-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-md border text-xs font-medium",
        tones[resolvedTone],
        className,
      )}
    >
      {icon}
      {label}
    </span>
  );
};

// ─── TABS ───

export const UnderlineTabs = <T extends string>({
  layoutId,
  tabs,
  value,
  onChange,
  className,
}: {
  layoutId: string;
  tabs: readonly { key: T; label: string; count?: number | string }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) => (
  <div
    className={cn(
      "flex items-center gap-7 border-b border-ink/10 overflow-x-auto no-scrollbar",
      className,
    )}
  >
    {tabs.map((t) => {
      const isActive = value === t.key;
      return (
        <button
          key={t.key}
          type="button"
          onClick={() => onChange(t.key)}
          className={cn(
            "relative pb-3 pt-1 text-sm tracking-[0.01em] whitespace-nowrap transition-colors",
            isActive
              ? "text-ink font-medium"
              : "text-ink/45 hover:text-ink/75 font-normal",
          )}
        >
          <span className="inline-flex items-baseline gap-2">
            <span>{t.label}</span>
            {t.count !== undefined && (
              <span className="font-mono text-[10px] text-ink/40 tracking-[0.1em]">
                {t.count}
              </span>
            )}
          </span>
          {isActive && (
            <motion.span
              layoutId={layoutId}
              className="absolute left-0 right-0 -bottom-[1px] h-[2px] bg-ink"
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
            />
          )}
        </button>
      );
    })}
  </div>
);

// ─── FORMS ───

interface MaisonInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
  error?: string;
  hint?: string;
}

export const MaisonInput = forwardRef<HTMLInputElement, MaisonInputProps>(
  ({ label, icon, error, hint, className, id, ...rest }, ref) => {
    const inputId = id || rest.name;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block font-mono text-[10px] uppercase tracking-[0.18em] text-ink/55 mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 text-ink/40">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full bg-transparent border-0 border-b border-ink/20 rounded-none px-0 py-2.5 text-sm text-ink placeholder:text-ink/30",
              "focus:outline-none focus:border-ink transition-colors",
              error && "border-red-500 focus:border-red-500",
              icon && "pl-7",
              className,
            )}
            {...rest}
          />
        </div>
        {error && (
          <p className="text-xs text-red-600 mt-1">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-ink/50 mt-1">{hint}</p>
        )}
      </div>
    );
  },
);
MaisonInput.displayName = "MaisonInput";

// ─── BUTTONS ───

type BtnVariant = "primary" | "secondary" | "ghost" | "danger" | "link";
type BtnSize = "sm" | "md" | "lg";

interface MaisonButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  size?: BtnSize;
  fullWidth?: boolean;
  asChild?: boolean;
  children: ReactNode;
  loading?: boolean;
}

export const MaisonButton = ({
  variant = "primary",
  size = "md",
  fullWidth,
  asChild = false,
  className,
  children,
  loading,
  disabled,
  ...rest
}: MaisonButtonProps) => {
  const Comp: React.ElementType = asChild ? Slot : "button";

  const sizes: Record<BtnSize, string> = {
    sm: "px-3 py-1.5 text-[11px] tracking-[0.14em]",
    md: "px-5 py-3 text-[11px] tracking-[0.18em]",
    lg: "px-7 py-4 text-[12px] tracking-[0.2em]",
  };

  const variants: Record<BtnVariant, string> = {
    primary:
      "bg-ink text-paper hover:bg-ink/85 border border-ink disabled:bg-ink/50",
    secondary:
      "bg-blue-600 text-paper hover:bg-blue-700 border border-blue-600 disabled:bg-blue-600/50",
    ghost:
      "bg-transparent text-ink border border-ink/20 hover:border-ink hover:bg-ink/[0.04] disabled:opacity-50",
    danger:
      "bg-transparent text-red-600 border border-red-600/40 hover:bg-red-600 hover:text-paper hover:border-red-600 disabled:opacity-50",
    link:
      "bg-transparent text-ink underline underline-offset-[6px] decoration-ink/30 hover:decoration-ink border-none px-0 py-0 disabled:opacity-50",
  };

  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center gap-2 font-mono uppercase font-medium rounded-none transition-all duration-200 disabled:cursor-not-allowed",
        sizes[size],
        variants[variant],
        fullWidth && "w-full",
        className,
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {children}
    </Comp>
  );
};

// ─── ALERTS ───

export const Alert = ({
  type = "info",
  title,
  message,
  action,
  className,
}: {
  type?: "info" | "success" | "warning" | "error";
  title?: string;
  message: string;
  action?: ReactNode;
  className?: string;
}) => {
  const styles: Record<string, string> = {
    info: "bg-blue-50 border-blue-200 text-blue-900",
    success: "bg-green-50 border-green-200 text-green-900",
    warning: "bg-amber-50 border-amber-200 text-amber-900",
    error: "bg-red-50 border-red-200 text-red-900",
  };

  const icons: Record<string, ReactNode> = {
    info: <Info className="h-5 w-5" />,
    success: <CheckCircle className="h-5 w-5" />,
    warning: <AlertCircle className="h-5 w-5" />,
    error: <AlertCircle className="h-5 w-5" />,
  };

  return (
    <div
      className={cn(
        "flex gap-4 p-4 border rounded-lg",
        styles[type],
        className
      )}
    >
      <div className="shrink-0">{icons[type]}</div>
      <div className="flex-1">
        {title && <p className="font-semibold text-sm mb-1">{title}</p>}
        <p className="text-sm">{message}</p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

// ─── DROPDOWN ───

export const Dropdown = ({
  trigger,
  items,
  className,
}: {
  trigger: ReactNode;
  items: Array<{ label: string; onClick: () => void; danger?: boolean }>;
  className?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("relative inline-block", className)}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 border border-ink/20 rounded-lg hover:border-ink/40 transition-colors"
      >
        {trigger}
        <ChevronDown className="h-4 w-4 text-ink/50" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-ink/10 rounded-lg shadow-lg z-50">
          {items.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                item.onClick();
                setOpen(false);
              }}
              className={cn(
                "w-full text-left px-4 py-2.5 text-sm hover:bg-ink/5 transition-colors first:rounded-t-lg last:rounded-b-lg",
                item.danger && "text-red-600 hover:bg-red-50"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
