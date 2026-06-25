import { useState, useEffect } from "react";
import { Link, useNavigate, Outlet, Navigate, useLocation } from "react-router-dom";
import {
  ArrowUpRight,
  LogOut,
  RefreshCw,
  Settings as SettingsIcon,
  Loader2,
  Check,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AppLogo } from '@/components/app/SubformeLogo';
import { handleLogout } from "@/lib/auth/logoutHandler";
import FullPageLoader from "@/components/FullPageLoader";
import { useRoleRedirect } from "@/hooks/useRoleRedirect";
import VersionSwitcherBanner from "@/components/VersionSwitcherBanner";
import { cn } from "@/lib/utils";

type Skin = "v3" | "editorial";
const SKIN_KEY = "vendor_skin";

function mapPath(pathname: string, target: Skin): string {
  const stripped = pathname.replace(/^\/v3(?=\/|$)/, "") || "/";
  return target === "v3"
  ? stripped === "/"? "/v3" : `/v3${stripped}`
    : stripped;
}

function getSkinFromPath(pathname: string): Skin {
  return pathname.startsWith("/v3")? "v3" : "editorial";
}

const VendorLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Derive skin from URL first, fallback to localStorage
  const [skin, setSkin] = useState<Skin>(() => {
    const pathSkin = getSkinFromPath(location.pathname);
    const stored = localStorage.getItem(SKIN_KEY) as Skin;
    return pathSkin || stored || "editorial";
  });

  // Sync localStorage when skin changes
  useEffect(() => {
    localStorage.setItem(SKIN_KEY, skin);
  }, [skin]);

  const { isLoading, isError, role } = useRoleRedirect("/vendor");

  if (isLoading) {
    return <FullPageLoader text="Authenticating..." />;
  }

  if (isError ||!role) {
    return <Navigate to="/vendor-login" replace />;
  }

  const refresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["vendor", "me"] });
    setTimeout(() => {
      setRefreshing(false);
      toast.success("Bookings refreshed");
    }, 400);
  };

  const handleLogOut = () => {
    if (isLoggingOut) return;
    handleLogout(setIsLoggingOut, navigate, false);
  };

  const handleSkinSwitch = (newSkin: Skin) => {
    if (newSkin === skin) return;
    setSkin(newSkin);
    const newPath = mapPath(location.pathname, newSkin);
    navigate(newPath);
    toast.success(`Switched to ${newSkin === "v3"? "Modern" : "Editorial"} interface`);
  };

  const isV3 = skin === "v3";
  const rootClasses = isV3
  ? "min-h-screen bg-paper text-ink font-v3-body"
    : "min-h-screen bg-paper text-ink";

  const headerClasses = isV3
  ? "border-b border-ink/10 bg-gradient-to-br from-paper to-paper-deep/40"
    : "border-b-2 border-ink";

  const buttonClasses = isV3
  ? "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-br from-print-orange to-print-red text-paper shadow-[0_8px_20px_-10px_hsl(var(--print-red)/0.55)] hover:opacity-90"
    : "inline-flex items-center gap-1.5 px-3 py-1.5 hover:bg-print-red";

  return (
    <div className={rootClasses}>
      <VersionSwitcherBanner currentVersion={skin} />

      <header className={headerClasses}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-10">
          <Link to="/" className="flex items-center gap-3" aria-label="Subforme home">
            <AppLogo />
          </Link>
          <nav className={cn(
            "flex items-center gap-3",
            isV3? "text-sm" : "font-mono-display text-[12px] uppercase tracking-[0.2em]"
          )}>
            <span className="hidden text-ink/60 md:inline cursor-pointer">
              Vendor Portal
            </span>

            <div className={cn(
              "inline-flex items-stretch",
              isV3
              ? "rounded-xl overflow-hidden shadow-lg"
                : "border-2 border-ink bg-ink text-paper"
            )}>
              <button
                onClick={() => navigate(mapPath("/vendor/dashboard", skin))}
                className={buttonClasses}
              >
                Open dashboard <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    aria-label="Dashboard settings"
                    className={cn(
                      isV3
                      ? "px-2 bg-gradient-to-br from-print-orange to-print-red text-paper hover:opacity-90 flex items-center justify-center"
                        : "border-l border-paper/30 px-2 hover:bg-print-red flex items-center justify-center"
                    )}
                  >
                    <SettingsIcon className="h-3.5 w-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className={cn("w-60", isV3 && "rounded-xl")}>
                  <DropdownMenuLabel className={cn(
                    isV3
                    ? "text-[11px] text-ink/50 font-semibold"
                      : "text-[10px] uppercase tracking-[0.2em] text-ink/60"
                  )}>
                    Quick settings
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <div className="px-2 py-2">
                    <p className={cn(
                      "mb-2",
                      isV3
                      ? "text-[11px] text-ink/50 font-semibold"
                        : "font-mono-display text-[10px] uppercase tracking-[0.2em] text-ink/55"
                    )}>
                      Interface Style
                    </p>
                    <div className={cn(
                      "grid grid-cols-2 gap-2",
                    !isV3 && "border-2 border-ink"
                    )}>
                      <button
                        onClick={() => handleSkinSwitch("editorial")}
                        className={cn(
                          "flex items-center justify-between px-3 py-2 text-xs transition-colors",
                          isV3? "rounded-lg" : "border-r-2 border-ink",
                          skin === "editorial"
                          ? isV3
                            ? "bg-ink/8 text-ink font-medium"
                              : "bg-ink text-paper"
                            : isV3
                            ? "hover:bg-ink/5 text-ink/70"
                              : "bg-paper text-ink hover:bg-ink/[0.04]"
                        )}
                      >
                        <span className={isV3? "" : "font-mono-display uppercase tracking-[0.2em]"}>
                          Editorial
                        </span>
                        {skin === "editorial" && <Check className="h-3 w-3" />}
                      </button>
                      <button
                        onClick={() => handleSkinSwitch("v3")}
                        className={cn(
                          "flex items-center justify-between px-3 py-2 text-xs transition-colors",
                          isV3 && "rounded-lg",
                          skin === "v3"
                          ? isV3
                            ? "bg-ink/8 text-ink font-medium"
                              : "bg-ink text-paper"
                            : isV3
                            ? "hover:bg-ink/5 text-ink/70"
                              : "bg-paper text-ink hover:bg-ink/[0.04]"
                        )}
                      >
                        <span className={isV3? "font-semibold" : "font-mono-display uppercase tracking-[0.2em]"}>
                          Modern
                        </span>
                        {skin === "v3" && <Check className="h-3 w-3" />}
                      </button>
                    </div>
                  </div>

                  <DropdownMenuSeparator />
                  <div className="px-2 py-2">
                    <p className={cn(
                      "mb-2",
                      isV3
                      ? "text-[11px] text-ink/50 font-semibold"
                        : "font-mono-display text-[10px] uppercase tracking-[0.2em] text-ink/55"
                    )}>
                      Theme
                    </p>
                    <ThemeToggle variant={skin} />
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={refresh} disabled={refreshing}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${refreshing? "animate-spin" : ""}`} />
                    {refreshing? "Refreshing…" : "Refresh bookings"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(mapPath("/vendor", skin))}>
                    <ArrowUpRight className="h-4 w-4 mr-2" /> Go to home
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <button
              type="button"
              onClick={handleLogOut}
              disabled={isLoggingOut}
              className="inline-flex items-center gap-1.5 text-ink hover:text-print-red"
            >
              {isLoggingOut? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />} Sign out
            </button>
          </nav>
        </div>

        {!isV3 && (
          <>
            <div className="border-t border-ink/30">
              <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-2 font-mono-display text-[11px] uppercase tracking-[0.25em] text-ink/70 md:px-10">
                <span>Vol. 01 · Vendor Portal</span>
                <span className="hidden md:inline">The Subforme Ledger</span>
                <span>Storefront overview</span>
              </div>
            </div>
            <div className="border-t-2 border-ink" />
          </>
        )}
      </header>

      <main>
        <Outlet context={{ skin }} />
      </main>

      <footer className={isV3? "border-t border-ink/10 mt-12" : "border-t-2 border-ink mt-12"}>
        <div className={cn(
          "mx-auto max-w-7xl px-5 py-6 md:px-10 flex flex-wrap items-center justify-between gap-3",
          isV3
          ? "text-sm text-ink/60"
            : "font-mono-display text-[11px] uppercase tracking-[0.25em] text-ink/60"
        )}>
          <span>&copy; <AppLogo inline className="text-sm!normal-case" /> &trade; {new Date().getFullYear()}</span>
          <div className="flex items-center gap-4">
            <Link to="/vendor/request-listing" className="hover:text-print-red">Request listing</Link>
            <a href="mailto:providers@subforme.app" className="hover:text-print-red">Support</a>
            <button type="button" onClick={handleLogOut} disabled={isLoggingOut} className="hover:text-print-red">Sign out</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default VendorLayout;