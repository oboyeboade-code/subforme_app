import { Link, NavLink } from "react-router-dom";
import { ShoppingCart, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppLogo } from "./SubformeLogo";

type Tab = {
  to: string;
  label: string;
  end?: boolean;
};

type Props = {
  tabs: Tab[];
  cartCount: number;
  coins: number;
  isLoggingOut: boolean;
  onLogout: () => void;
  onOpenSpider: () => void;
  onOpenMobileMenu: () => void;
};

const AppHeader = ({
  tabs,
  cartCount,
  coins,
  isLoggingOut,
  onLogout,
  onOpenSpider,
  onOpenMobileMenu,
}: Props) => {
  return (
    <header className="sticky top-0 z-50 bg-paper border-b-2 border-ink">
      {/* TOP ROW */}
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/app" aria-label="Subforme home">
          <AppLogo />
        </Link>

        <span className="font-mono-display text-xs uppercase tracking-wider text-ink/60">
          Editorial
        </span>
      </div>

      {/* SECOND ROW */}
      <div className="border-t-2 border-ink bg-paper-deep">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-4">

          {/* LEFT - takes 1/3 */}
          <div className="flex-1 flex items-center gap-3">
            <button
              onClick={onOpenSpider}
              className="hidden sm:flex items-center gap-2 font-mono-display text-xs uppercase tracking-wider text-ink hover:text-print-red transition-colors"
            >
              <span>play</span>
            </button>

            {/* mobile menu trigger */}
            <button
              className="sm:hidden border-2 border-ink px-3 py-1.5"
              onClick={onOpenMobileMenu}
            >
              <Menu />
            </button>
          </div>

          {/* CENTER NAV - sizes to content only */}
          <nav className="hidden sm:block flex-none">
            <ul className="flex items-center gap-2 font-mono-display text-xs uppercase tracking-wider">
              {tabs.map((t) => (
                <li key={t.to}>
                  <NavLink
                    to={t.to}
                    end={t.end}
                    className={({ isActive }) =>
                      cn(
                        "px-3 py-1.5 border-2 transition-colors",
                        isActive
                         ? "bg-ink text-paper border-ink"
                          : "border-transparent hover:border-ink"
                      )
                    }
                  >
                    {t.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* RIGHT - takes 1/3, content right-aligned */}
          <div className="flex-1 flex items-center justify-end gap-3">

            {/* cart */}
            <Link
              to="/app/dashboard"
              className="relative border-2 border-ink px-3 py-1.5"
              aria-label={`Cart with ${cartCount} items`}
            >
              <ShoppingCart className="h-4 w-4" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-print-red text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* coins */}
            <Link
              to="/app/voucher"
              className="hidden sm:block border-2 border-ink px-3 py-1.5 text-xs uppercase"
            >
              coins: {coins.toLocaleString()}
            </Link>

            {/* logout - fixed min width so text doesn't push */}
            <button
              onClick={onLogout}
              disabled={isLoggingOut}
              className="min-w-[110px] border-2 border-print-red px-3 py-1.5 text-print-red text-xs uppercase text-center"
            >
              {isLoggingOut? "..." : "logout"}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;