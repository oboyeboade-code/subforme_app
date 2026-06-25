import { useState } from "react";
import { Link, Outlet, Navigate } from "react-router-dom";
import { AppLogo } from "./SubformeLogo";
import { useNavigate } from "react-router-dom";
import { useRoleRedirect } from "@/hooks/useRoleRedirect";
import { SpiderModal } from "./SpiderModal";
import { handleLogout } from "@/lib/auth/logoutHandler";
import { SettingsModal } from "./SettingsModal";
import { coinApi, cartApi, type ICartItem, type CoinBalanceData } from "@/lib/api/";
import useSWR from "swr";
import FullPageLoader from "@/components/FullPageLoader";
import AppHeader from "@/components/app/AppHeader";
import MobileDrawer from "@/components/app/MobileDrawer";
import VersionSwitcherBanner from "@/components/VersionSwitcherBanner"; // Added import

const TABS = [
  { to: "/app", label: "Home", end: true },
  { to: "/app/offers", label: "Services" },
  { to: "/app/dashboard", label: "Dashboard" },
  { to: "/app/subs", label: "Subs" },
];

const AppLayout = () => {

  const [mobileOpen, setMobileOpen] = useState(false);
  const [spiderOpen, setSpiderOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

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

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  const { isLoading, isError, role } = useRoleRedirect(
    "/app"
  );

  if (isLoading) {
    return <FullPageLoader text="Authenticating..." />;
  }

  if (isError || !role) {
    return <Navigate to="/login" replace />;
  }

  if (!cart || !coinsData) return <FullPageLoader text="Loading Data..." />

  const handleLogOut = () => {
    if (isLoggingOut) return;
    handleLogout(setIsLoggingOut, navigate, false);
  };

  return (
    <>
      {/* Version Switcher Banner added at the top of the page */}
      <VersionSwitcherBanner currentVersion="editorial" />
      <div className="min-h-screen bg-paper text-ink flex flex-col">

        <AppHeader
          tabs={TABS}
          cartCount={cart.length ?? 0}
          coins={coinsData?.balance ?? 0}
          isLoggingOut={isLoggingOut}
          onLogout={handleLogOut}
          onOpenSpider={() => setSpiderOpen(true)}
          onOpenMobileMenu={() => setMobileOpen(true)}
        />

        <MobileDrawer
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          tabs={TABS}
          cartCount={cart.length ?? 0}
          coins={coinsData?.balance ?? 0}
          onLogout={handleLogOut}
          onOpenSpider={() => setSpiderOpen(true)}   // NEW
        />

        <main className="flex-1">
          <Outlet />
        </main>

        <footer className="border-t-2 border-ink bg-paper-deep">
          <div className="max-w-6xl mx-auto px-6 py-4 font-mono-display text-xs uppercase tracking-wider text-muted-foreground flex items-center justify-between flex-wrap gap-3">
          <span>&copy; <AppLogo inline className="text-sm !normal-case" /> &trade; {new Date().getFullYear()} · Editorial Ledger Vol. I</span>
            <div className="flex items-center gap-4">
              <Link to="/app/voucher" className="hover:text-ink transition-colors">Rewards</Link>
              <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                className="uppercase tracking-wider hover:text-ink transition-colors"
              >
                Help &amp; settings
              </button>
            </div>
          </div>
        </footer>

        <SpiderModal open={spiderOpen} onOpenChange={setSpiderOpen} />
        <SettingsModal
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
        />
        
      </div>
    </>
  );
};

export default AppLayout;
