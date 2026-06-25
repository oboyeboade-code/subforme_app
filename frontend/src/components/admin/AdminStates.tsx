import { ReactNode } from "react";
import { motion } from "framer-motion";
import { MaisonEyebrow, Rule } from "@/components/admin/AdminMaison";

/**
 * Lightweight skeleton primitive used across the admin surfaces.
 * Tone matches the editorial "ink-on-paper" palette so the placeholders
 * read as paper artifacts rather than generic gray blocks.
 */
export const AdminSkeleton = ({ className = "" }: { className?: string }) => (
  <div
    className={`animate-pulse bg-ink/10 rounded-[2px] ${className}`}
    aria-hidden
  />
);

/** Four-up metric grid skeleton — matches AdminHome / AdminDashboard "Pulse" section. */
export const MetricsSkeleton = ({ count = 4 }: { count?: number }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className={
          i < count - 1 ? "lg:border-r lg:border-ink/10 lg:pr-10 space-y-3" : "space-y-3"
        }
      >
        <AdminSkeleton className="h-3 w-20" />
        <AdminSkeleton className="h-10 w-28" />
        <AdminSkeleton className="h-3 w-24" />
      </div>
    ))}
  </>
);

/**
 * List-row skeleton aligned with the column grids used in
 * AdminContactMessages / AdminVendorRequests / AdminServices.
 */
export const RowsSkeleton = ({
  count = 6,
  columns = "grid-cols-[40px_24px_1.4fr_1.6fr_120px_100px]",
}: {
  count?: number;
  columns?: string;
}) => (
  <div>
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className={`grid ${columns} gap-4 items-center py-5 border-b border-ink/8`}
      >
        <AdminSkeleton className="h-3 w-6" />
        <AdminSkeleton className="h-2.5 w-2.5 rounded-full" />
        <div className="space-y-2">
          <AdminSkeleton className="h-3.5 w-3/4" />
          <AdminSkeleton className="h-2.5 w-1/2" />
        </div>
        <AdminSkeleton className="h-3 w-2/3" />
        <AdminSkeleton className="h-3 w-20" />
        <AdminSkeleton className="h-3 w-14" />
      </div>
    ))}
  </div>
);

/** Card-grid skeleton — used by AdminProviders and AdminSettings admin cards. */
export const CardsSkeleton = ({
  count = 6,
  cols = "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
}: {
  count?: number;
  cols?: string;
}) => (
  <div className={`grid ${cols} gap-6`}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="border border-ink/15 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <AdminSkeleton className="h-3 w-20" />
          <AdminSkeleton className="h-2.5 w-2.5 rounded-full" />
        </div>
        <div className="space-y-2">
          <AdminSkeleton className="h-5 w-2/3" />
          <AdminSkeleton className="h-3 w-1/2" />
        </div>
        <Rule />
        <div className="flex items-center justify-between">
          <AdminSkeleton className="h-3 w-24" />
          <AdminSkeleton className="h-3 w-16" />
        </div>
      </div>
    ))}
  </div>
);

/** Simple list-rows skeleton (no avatar/status column) — used for AdminCodes. */
export const ListRowsSkeleton = ({ count = 6 }: { count?: number }) => (
  <div>
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="flex items-center gap-4 py-5 border-b border-ink/8 last:border-b-0"
      >
        <AdminSkeleton className="h-2.5 w-2.5 rounded-full" />
        <div className="flex-1 min-w-0 space-y-2">
          <AdminSkeleton className="h-3.5 w-1/3" />
          <AdminSkeleton className="h-2.5 w-1/2" />
        </div>
        <AdminSkeleton className="h-3 w-16" />
      </div>
    ))}
  </div>
);

/** Hero / masthead skeleton — for the personalised greeting on AdminHome. */
export const HeroSkeleton = () => (
  <div className="space-y-4 py-2">
    <AdminSkeleton className="h-3 w-24" />
    <AdminSkeleton className="h-12 w-2/3" />
    <AdminSkeleton className="h-3 w-1/2" />
  </div>
);

export interface AdminEmptyStateProps {
  index?: string;
  title: string;
  hint?: string;
  action?: ReactNode;
}

/**
 * Editorial empty state — quiet, paper-feel, optional eyebrow + action.
 * Replaces the one-line "The page is quiet" divs that were scattered around.
 */
export const AdminEmptyState = ({
  index = "—",
  title,
  hint,
  action,
}: AdminEmptyStateProps) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="border-y border-ink/10 py-16 text-center"
  >
    <MaisonEyebrow>No. {index}</MaisonEyebrow>
    <p className="font-v3-display italic text-2xl md:text-3xl text-ink mt-3">
      {title}
    </p>
    {hint && (
      <p className="text-xs text-ink/55 mt-3 max-w-md mx-auto leading-relaxed">
        {hint}
      </p>
    )}
    {action && <div className="mt-6 inline-flex">{action}</div>}
  </motion.div>
);
