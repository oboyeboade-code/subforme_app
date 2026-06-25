import { useState } from "react";
import { Link, NavLink, Outlet, useLocation, Navigate, useNavigate } from "react-router-dom";
import { V3AppLogo } from "./V3SubformeLogo";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, LogOut, Sparkles, Menu, X, ShoppingCart, Loader2 } from "lucide-react";
import { SpiderModal } from "@/components/app/SpiderModal";
import { SettingsModal } from "@/components/app/SettingsModal";
import { coinApi, cartApi, type CoinBalanceData, type ICartItem } from "@/lib/api/";
import { cn } from "@/lib/utils";
import { handleLogout } from "@/lib/auth/logoutHandler";
import { useRoleRedirect } from "@/hooks/useRoleRedirect";
import FullPageLoader from "@/components/FullPageLoader";
import useSWR from "swr";


const TABS = [
  { to: "/v3/app", label: "Home", end: true },
  { to: "/v3/app/offers", label: "Services" },
  { to: "/v3/app/dashboard", label: "Dashboard" },
  { to: "/v3/app/subs", label: "Subs" },
];

const V3AppLayout = () => {
  const [spiderOpen, setSpiderOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { data: coinsData, isLoading: coinsLoading } = useSWR<CoinBalanceData>(
    "coins/balance",
    () => coinApi.getBalance().then(res => res.data),
    { revalidateOnFocus: false }
  );

  const { data: cart, isLoading: cartLoading } = useSWR<ICartItem[]>(
    "customer/cart",
    () => cartApi.getCart().then(res => res.data.cart),
    { revalidateOnFocus: false }
  );

  const location = useLocation();
  const navigate = useNavigate();

  const { isLoading, isError, role } = useRoleRedirect(
    "/v3/app",
    true
  );

  if (isLoading) {
    return <FullPageLoader text="Authenticating..." />;
  }

  if (isError || !role) {
    return <Navigate to="/v3/login" replace />;
  }

  if (!cart || !coinsData) return <FullPageLoader text="Loading Data..." />

  const onLogoutClick = () => {
    if (isLoggingOut) return;
    handleLogout(setIsLoggingOut, navigate);
  };

  return (
    <div className="min-h-screen v3-bg text-ink flex flex-col font-v3">
      <header className="sticky top-0 z-40 backdrop-blur-md bg-paper/75 border-b border-ink/5">
        <div className="max-w-7xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between gap-4">
          <Link to="/v3/app" className="flex items-center gap-2">
            <V3AppLogo />
          </Link>

          <span className="text-xs font-medium text-ink/50 hidden sm:block">
            Modern
          </span>

          <nav className="hidden md:block">
            <ul className="flex items-center gap-1 bg-ink/[0.04] rounded-full p-1">
              {TABS.map((t) => (
                <li key={t.to}>
                  <NavLink
                    to={t.to}
                    end={t.end}
                    className={({ isActive }) =>
                      cn(
                        "relative px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                        isActive ? "text-paper" : "text-ink/70 hover:text-ink",
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <motion.span
                            layoutId="v3-nav-pill"
                            className="absolute inset-0 rounded-full bg-ink -z-0"
                            transition={{ type: "spring", stiffness: 400, damping: 32 }}
                          />
                        )}
                        <span className="relative z-10">{t.label}</span>
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setSpiderOpen(true)}
              className="h-9 w-9 rounded-full border border-ink/12 bg-paper/70 text-print-orange flex items-center justify-center hover:bg-paper transition-colors"
              aria-label="Play"
            >
              <Sparkles className="h-4 w-4" />
            </button>

            <Link
              to="/v3/app/dashboard"
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full border border-ink/12 bg-paper/70 text-sm font-medium hover:bg-paper transition-colors relative"
              aria-label={`Shopping cart with ${cart.length} items`}
            >
              <ShoppingCart className="h-3.5 w-3.5 text-print-orange" />
              {cart.length > 0 && (
                <motion.span
                  key={cart.length}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-print-red text-white text-xs font-bold absolute -top-2 -right-2"
                >
                  {cart.length}
                </motion.span>
              )}
            </Link>

            <motion.div
              key={coinsData?.balance}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.3 }}
            >
              <Link
                to="/v3/app/voucher"
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full border border-ink/12 bg-paper/70 text-sm font-medium hover:bg-paper transition-colors"
              >
                <Coins className="h-3.5 w-3.5 text-print-orange" />
                {coinsLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-ink/40" />
                ) : (
                  coinsData?.balance.toLocaleString()
                )}
              </Link>
            </motion.div>

            <button
              onClick={onLogoutClick}
              disabled={isLoggingOut}
              aria-busy={isLoggingOut}
              className="h-9 w-9 rounded-full bg-gradient-to-br from-print-red to-print-orange text-paper flex items-center justify-center shadow-[0_8px_18px_-10px_hsl(var(--print-red)/0.6)] hover:brightness-105 disabled:opacity-70 disabled:cursor-not-allowed"
              aria-label="Sign out"
            >
              {isLoggingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
            </button>
          </div>

          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden h-9 w-9 rounded-full border border-ink/12 bg-paper flex items-center justify-center"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden border-t border-ink/5 bg-paper overflow-hidden"
            >
              <div className="px-5 py-4 flex flex-col gap-2">
                {TABS.map((t) => (
                  <NavLink
                    key={t.to}
                    to={t.to}
                    end={t.end}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "block px-4 py-3 rounded-xl text-sm font-medium",
                        isActive ? "bg-ink text-paper" : "bg-ink/[0.04] text-ink",
                      )
                    }
                  >
                    {t.label}
                  </NavLink>
                ))}
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <button
                    onClick={() => {
                      setSpiderOpen(true);
                      setMobileOpen(false);
                    }}
                    className="px-2 py-3 rounded-xl border border-ink/12 text-xs font-medium"
                  >
                    Play
                  </button>
                  <Link
                    to="/v3/app/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="px-2 py-3 rounded-xl border border-ink/12 text-xs font-medium text-center relative"
                  >
                    <ShoppingCart className="h-4 w-4 mx-auto mb-1" />
                    {cart.length > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center h-4 w-4 rounded-full bg-print-red text-white text-xs font-bold">
                        {cart.length}
                      </span>
                    )}
                  </Link>
                  <button
                    onClick={onLogoutClick}
                    disabled={isLoggingOut}
                    aria-busy={isLoggingOut}
                    className="px-2 py-3 rounded-xl bg-gradient-to-br from-print-red to-print-orange text-paper text-xs font-medium disabled:opacity-70 flex items-center justify-center gap-1"
                    aria-label="Sign out"
                  >
                    {isLoggingOut ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Out</span>
                      </>
                    ) : (
                      "Out"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] } as any}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="border-t border-ink/5 mt-12">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-6 flex items-center justify-between flex-wrap gap-3 text-sm text-ink/55">
          <span>&copy; <V3AppLogo inline className="text-sm" /> &trade; {new Date().getFullYear()}</span>
          <div className="flex items-center gap-4">
            <Link to="/v3/app/voucher" className="hover:text-ink transition-colors">
              Rewards
            </Link>
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="hover:text-ink transition-colors"
            >
              Help &amp; settings
            </button>
          </div>
        </div>
      </footer>

      <SpiderModal open={spiderOpen} onOpenChange={setSpiderOpen} />
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
};

export default V3AppLayout;