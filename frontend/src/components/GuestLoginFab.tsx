import { useEffect, useRef, useState } from "react";
import { Shield, Store, UserRound, Crown, X, LogIn } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type Props = {
  disabled?: boolean;
  onAdmin?: () => void;
  onVendor?: () => void;
  onCustomer?: () => void;
  onSuperAdmin?: () => void;
};

export function GuestLoginFab({
  disabled,
  onAdmin,
  onVendor,
  onCustomer,
  onSuperAdmin
}: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (containerRef.current &&!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", handle);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", handle);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <TooltipProvider delayDuration={200}>
      <div
        ref={containerRef}
        className="fixed bottom-28 right-6 z-50 flex items-center justify-end"
      >
        {/* Expanding glass pill - wider for 4 buttons */}
        <div
          className={[
            "flex items-center overflow-hidden rounded-full border border-white/40 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.25)]",
            "bg-white/30 backdrop-blur-xl backdrop-saturate-150",
            "transition-[width,padding] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
            open? "w- pl-2 pr-16" : "w-16 pl-0 pr-16",
          ].join(" ")}
          style={{ height: "4rem" }}
        >
          <div
            className={[
              "flex w-full items-center gap-2 transition-all duration-300",
              open
             ? "translate-x-0 opacity-100 delay-150"
                : "-translate-x-4 opacity-0 pointer-events-none",
            ].join(" ")}
          >
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                setOpen(false);
                onCustomer?.();
              }}
              className="group flex flex-1 items-center gap-2 rounded-full border border-white/50 bg-white/40 px-3 py-2 text-sm font-medium text-foreground shadow-sm backdrop-blur transition hover:bg-white/70 hover:shadow-md disabled:opacity-50"
            >
              <UserRound className="h-4 w-4 shrink-0" />
              <span className="truncate">Customer</span>
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                setOpen(false);
                onVendor?.();
              }}
              className="group flex flex-1 items-center gap-2 rounded-full border border-white/50 bg-white/40 px-3 py-2 text-sm font-medium text-foreground shadow-sm backdrop-blur transition hover:bg-white/70 hover:shadow-md disabled:opacity-50"
            >
              <Store className="h-4 w-4 shrink-0" />
              <span className="truncate">Vendor</span>
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                setOpen(false);
                onAdmin?.();
              }}
              className="group flex flex-1 items-center gap-2 rounded-full border border-white/50 bg-white/40 px-3 py-2 text-sm font-medium text-foreground shadow-sm backdrop-blur transition hover:bg-white/70 hover:shadow-md disabled:opacity-50"
            >
              <Shield className="h-4 w-4 shrink-0" />
              <span className="truncate">Admin</span>
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                setOpen(false);
                onSuperAdmin?.();
              }}
              className="group flex flex-1 items-center gap-2 rounded-full border border-white/50 bg-white/40 px-3 py-2 text-sm font-medium text-foreground shadow-sm backdrop-blur transition hover:bg-white/70 hover:shadow-md disabled:opacity-50"
            >
              <Crown className="h-4 w-4 shrink-0" />
              <span className="truncate">Super</span>
            </button>
          </div>
        </div>

        {/* Trigger circle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label={open? "Close demo login" : "Demo login"}
              aria-expanded={open}
              onClick={() => setOpen((v) =>!v)}
              disabled={disabled}
              className={[
                "absolute right-0 flex h-16 w-16 items-center justify-center rounded-full",
                "border border-white/50 bg-white/40 backdrop-blur-xl backdrop-saturate-150",
                "shadow-[0_10px_30px_-10px_rgba(0,0,0,0.35)] transition-transform duration-300",
                "hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
              ].join(" ")}
            >
              {!open &&!disabled && (
                <span className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-primary/20" />
              )}
              <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-inner">
                {open? <X className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}
              </span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" className="bg-foreground text-background">
            <p className="text-xs">Demo login — skip registration</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

export default GuestLoginFab;