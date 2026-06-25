import { useState, useEffect } from "react";
import { Link, useNavigate, Outlet, Navigate, useLocation } from "react-router-dom";
import {
  ArrowRight,
  LogOut,
  RefreshCw,
  Settings as SettingsIcon,
  Loader2,
  Check,
  Sparkles,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { V3AppLogo } from "@/components/v3/V3SubformeLogo";
import { handleLogout } from "@/lib/auth/logoutHandler";
import FullPageLoader from "@/components/FullPageLoader";
import { useRoleRedirect } from "@/hooks/useRoleRedirect";
import { cn } from "@/lib/utils";

type Skin = "v3" | "editorial";
const SKIN_KEY = "vendor_skin";

function mapPath(pathname: string, target: Skin): string {
  const stripped = pathname.replace(/^\/v3(?=\/|$)/, "") || "/";
  if (target === "v3") {
    if (stripped === "/" || stripped === "/vendor") return "/v3/vendor";
    return `/v3${stripped}`;
  }
  return stripped;
}

const V3VendorLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { isLoading, isError, role } = useRoleRedirect("/v3/vendor", true);

  if (isLoading) {
    return <FullPageLoader text="Authenticating..." />;
  }

  if (isError ||!role) {
    return <Navigate to="/v3/vendor-login" replace />;
  }

  const refreshBookings = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["vendor", "me"] });
    setTimeout(() => {
      setRefreshing(false);
      toast.success("Bookings refreshed");
    }, 400);
  };

  const handleLogOut = () => {
    if (isLoggingOut) return;
    handleLogout(setIsLoggingOut, navigate);
  };

  const handleSkinSwitch = (newSkin: Skin) => {
    if (newSkin === "v3") return; // already here
    localStorage.setItem(SKIN_KEY, newSkin);
    const newPath = mapPath(location.pathname, newSkin); // /v3/vendor/dashboard -> /vendor/dashboard
    navigate(newPath);
    toast.success("Switched to Editorial interface");
  };

  return (
    <div className="min-h-screen v3-bg text-ink font-v3-body">
      <header className="sticky top-0 z-40 backdrop-blur-md bg-paper/75 border-b border-ink/5">
        <div className="max-w-7xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
          <Link to="/v3" className="flex items-center gap-2">
            <V3AppLogo />
            <span className="text-sm text-ink/55 hidden sm:inline">/ vendor</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="inline-flex items-stretch rounded-full overflow-hidden bg-gradient-to-br from-print-red to-print-orange text-paper shadow-[0_10px_24px_-10px_hsl(var(--print-red)/0.55)]">
              <button
                onClick={() => navigate("/v3/vendor/dashboard")}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold hover:brightness-105 transition-all"
              >
                Open dashboard <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    aria-label="Dashboard settings"
                    className="border-l border-paper/25 px-2.5 hover:brightness-105 flex items-center justify-center transition-all"
                  >
                    <SettingsIcon className="h-3.5 w-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 rounded-xl border-ink/10 shadow-2xl">
                  <DropdownMenuLabel className="text-[11px] text-ink/50 font-semibold">
                    Quick settings
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {/* Skin Switcher - V3 styled */}
                  <div className="px-2 py-3">
                    <p className="text-[11px] text-ink/50 font-semibold mb-2.5 flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3 text-print-orange" />
                      Interface Style
                    </p>
                    <div className="space-y-2">
                      <button
                        onClick={() => handleSkinSwitch("editorial")}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs bg-ink/[0.04] hover:bg-ink/[0.08] text-ink/80 transition-all group"
                      >
                        <span className="font-medium">Editorial</span>
                        <span className="text-[10px] text-ink/40 group-hover:text-ink/60">Serif · ruled</span>
                      </button>
                      <button
                        onClick={() => {}}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs bg-gradient-to-br from-print-orange/10 to-print-red/10 border border-print-red/20 text-ink font-semibold"
                      >
                        <span>Modern</span>
                        <Check className="h-3.5 w-3.5 text-print-red" />
                      </button>
                    </div>
                  </div>

                  <DropdownMenuSeparator />
                  <div className="px-2 py-2">
                    <p className="text-[11px] text-ink/50 font-semibold mb-2">Theme</p>
                    <ThemeToggle variant="v3" />
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={refreshBookings} disabled={refreshing}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${refreshing? "animate-spin" : ""}`} />
                    {refreshing? "Refreshing…" : "Refresh bookings"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/v3/vendor")}>
                    <ArrowRight className="h-4 w-4 mr-2" /> Go to home
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <button
              type="button"
              onClick={handleLogOut}
              disabled={isLoggingOut}
              className="inline-flex items-center gap-1.5 text-xs text-ink/65 hover:text-print-red px-2 transition-colors"
            >
              {isLoggingOut? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />} Sign out
            </button>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="border-t border-ink/5 mt-12">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-6 flex flex-wrap items-center justify-between gap-3 text-xs text-ink/55">
          <span>&copy; <V3AppLogo inline className="text-sm" /> &trade; {new Date().getFullYear()}</span>
          <div className="flex items-center gap-4">
            <Link to="/v3/vendor/request-listing" className="hover:text-print-red transition-colors">Request listing</Link>
            <a href="mailto:providers@subforme.app" className="hover:text-print-red transition-colors">Support</a>
            <button type="button" onClick={handleLogOut} disabled={isLoggingOut} className="hover:text-print-red transition-colors">Sign out</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default V3VendorLayout;