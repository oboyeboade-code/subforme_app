import { ReactNode } from "react";

/**
 * Vendor-side skeleton primitive — uses the editorial "ink/paper" tone so
 * placeholders sit comfortably inside the brutalist bordered cards.
 */
export const VendorSkeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-ink/10 rounded-[2px] ${className}`} aria-hidden />
);

/** Hero block (display name + glance) skeleton for VendorPortal / VendorDashboard. */
export const VendorHeroSkeleton = () => (
  <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
    <div className="md:col-span-2 border-2 border-ink bg-paper-deep p-6 shadow-[6px_6px_0_0_hsl(var(--ink))] space-y-4">
      <VendorSkeleton className="h-3 w-24" />
      <VendorSkeleton className="h-14 md:h-20 w-2/3" />
      <VendorSkeleton className="h-4 w-3/4" />
      <div className="flex gap-3 pt-2">
        <VendorSkeleton className="h-3 w-20" />
        <VendorSkeleton className="h-3 w-24" />
        <VendorSkeleton className="h-3 w-28" />
      </div>
    </div>
    <aside className="border-2 border-ink bg-card p-5 shadow-[4px_4px_0_0_hsl(var(--ink))] space-y-4">
      <VendorSkeleton className="h-3 w-24" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex items-baseline justify-between border-b border-dashed border-ink/40 pb-2"
        >
          <VendorSkeleton className="h-3 w-24" />
          <VendorSkeleton className="h-5 w-10" />
        </div>
      ))}
      <VendorSkeleton className="h-9 w-full" />
    </aside>
  </section>
);

/** Service / booking card grid skeleton. */
export const VendorCardsSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: count }).map((_, i) => (
      <article
        key={i}
        className="relative border-2 border-ink bg-card p-5 shadow-[4px_4px_0_0_hsl(var(--ink))] space-y-3"
      >
        <VendorSkeleton className="h-3 w-20" />
        <VendorSkeleton className="h-5 w-3/4" />
        <VendorSkeleton className="h-3 w-full" />
        <VendorSkeleton className="h-3 w-2/3" />
        <div className="pt-4 mt-auto flex items-center justify-between border-t border-ink/20">
          <VendorSkeleton className="h-6 w-20" />
          <VendorSkeleton className="h-3 w-12" />
        </div>
      </article>
    ))}
  </div>
);

/** Three-up summary tiles for VendorEarnings. */
export const VendorTotalsSkeleton = () => (
  <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
    {Array.from({ length: 3 }).map((_, i) => (
      <article
        key={i}
        className="border-2 border-ink bg-card p-5 shadow-[4px_4px_0_0_hsl(var(--ink))] space-y-3"
      >
        <VendorSkeleton className="h-3 w-24" />
        <VendorSkeleton className="h-10 w-32" />
        <VendorSkeleton className="h-3 w-20" />
      </article>
    ))}
  </section>
);

/** Earnings table rows skeleton. */
export const VendorRowsSkeleton = ({ count = 5 }: { count?: number }) => (
  <ul className="divide-y-2 divide-ink border-2 border-ink bg-card">
    {Array.from({ length: count }).map((_, i) => (
      <li
        key={i}
        className="grid grid-cols-12 items-center gap-3 px-4 py-3 md:px-6"
      >
        <div className="col-span-12 md:col-span-5 space-y-2">
          <VendorSkeleton className="h-4 w-2/3" />
          <VendorSkeleton className="h-3 w-1/2" />
        </div>
        <VendorSkeleton className="col-span-4 md:col-span-2 h-3" />
        <VendorSkeleton className="col-span-4 md:col-span-2 h-3" />
        <VendorSkeleton className="col-span-4 md:col-span-3 h-5" />
      </li>
    ))}
  </ul>
);

export interface VendorEmptyStateProps {
  title: string;
  hint?: string;
  action?: ReactNode;
}

/**
 * Vendor empty state — brutalist dashed card matching the existing
 * "No services yet." / "No outstanding bookings." panels.
 */
export const VendorEmptyState = ({ title, hint, action }: VendorEmptyStateProps) => (
  <div className="border-2 border-dashed border-ink/40 bg-paper-deep px-6 py-16 text-center">
    <p className="font-editorial text-2xl">{title}</p>
    {hint && (
      <p className="font-mono-display mt-2 text-xs uppercase tracking-[0.2em] text-ink/60">
        {hint}
      </p>
    )}
    {action && <div className="mt-5 inline-flex">{action}</div>}
  </div>
);
