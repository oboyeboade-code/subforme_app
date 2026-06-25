import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { ShoppingCart, Coins, LogOut, X, Play } from "lucide-react";

type Tab = {
  to: string;
  label: string;
  end?: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;
  tabs: Tab[];
  cartCount: number;
  coins: number;
  onLogout: () => void;
  onOpenSpider?: () => void;
};

/**
 * Editorial-style mobile drawer.
 * - Matches AppHeader: bg-paper, border-2 border-ink, font-mono-display, uppercase.
 * - Tab switching is bulletproof: closes reactively on `pathname` change
 *   (no setTimeout race against react-router navigation).
 * - z-[60] backdrop / z-[70] panel cleanly overlay the sticky AppHeader (z-50).
 */
const MobileDrawer = ({
  open,
  onClose,
  tabs,
  cartCount,
  coins,
  onLogout,
  onOpenSpider,
}: Props) => {
  const { pathname } = useLocation();

  // Close drawer whenever the route actually changes — reactive, not timer-based.
  useEffect(() => {
    if (open) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-[60] bg-ink/60 transition-opacity duration-300 md:hidden",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-[70] h-full bg-paper border-r-2 border-ink md:hidden",
          "w-[88%] xs:w-[82%] sm:w-[70%] max-w-[360px]",
          "flex flex-col transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        {/* HEADER STRIP (matches AppHeader top row) */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b-2 border-ink">
          <span className="font-mono-display text-xs uppercase tracking-wider text-ink/60">
            Menu
          </span>
          <button
            onClick={onClose}
            className="border-2 border-ink p-1.5 hover:bg-ink hover:text-paper transition-colors"
            aria-label="Close menu"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* SECONDARY STRIP — Play / Spider (mirrors header's secondary row) */}
        {onOpenSpider && (
          <div className="border-b-2 border-ink bg-paper-deep px-4 sm:px-5 py-2.5 sm:py-3">
            <button
              onClick={() => {
                onOpenSpider();
                onClose();
              }}
              className="flex items-center gap-2 font-mono-display text-xs uppercase tracking-wider text-ink hover:text-print-red transition-colors"
            >
              <Play className="h-3 w-3" />
              <span>play</span>
            </button>
          </div>
        )}

        {/* NAV */}
        <nav className="flex-1 overflow-y-auto px-4 sm:px-5 py-5 sm:py-6">
          <p className="font-mono-display text-[10px] uppercase tracking-[0.2em] text-ink/50 mb-3">
            Sections
          </p>
          <ul className="flex flex-col gap-1.5 sm:gap-2">
            {tabs.map((t) => (
              <li key={t.to}>
                <NavLink
                  to={t.to}
                  end={t.end ?? false}
                  className={({ isActive }) =>
                    cn(
                      "block border-2 px-3 py-2 sm:py-2.5 font-mono-display text-[11px] sm:text-xs uppercase tracking-wider transition-colors",
                      isActive
                        ? "bg-ink text-paper border-ink"
                        : "border-transparent text-ink hover:border-ink"
                    )
                  }
                >
                  {t.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* FOOTER */}
        <div className="border-t-2 border-ink bg-paper-deep px-4 sm:px-5 py-3 sm:py-4 flex flex-col gap-2.5 sm:gap-3 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
          <div className="grid grid-cols-2 gap-2 sm:gap-3 font-mono-display text-[11px] sm:text-xs uppercase tracking-wider">
            <div className="border-2 border-ink px-2.5 sm:px-3 py-2 flex items-center gap-2 min-w-0">
              <ShoppingCart className="h-3.5 w-3.5" />
              <span className="truncate">{cartCount}</span>
            </div>
            <div className="border-2 border-ink px-2.5 sm:px-3 py-2 flex items-center gap-2 min-w-0">
              <Coins className="h-3.5 w-3.5" />
              <span className="truncate">{coins.toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="flex items-center justify-center gap-2 border-2 border-print-red text-print-red px-3 py-2 sm:py-2.5 font-mono-display text-[11px] sm:text-xs uppercase tracking-wider hover:bg-print-red hover:text-paper transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default MobileDrawer;
