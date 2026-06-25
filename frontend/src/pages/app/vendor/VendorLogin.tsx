import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ShieldCheck, Loader2 } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { handleLogin } from "@/lib/auth/loginHandler";

const VendorLogin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [vendorId, setVendorId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!vendorId || !password) {
      toast({
        title: "Missing details",
        description: "Enter your vendor ID and password to continue.",
        variant: "destructive",
      });
      return;
    }
    handleLogin({
      email: vendorId,
      password,
      expectedRole: "vendor",
      setLoading,
      navigate,
      queryClient,
      successMessage: "Opening the counter…",
    });
  };

  return (
    <AuthShell
      edition="Vol. I · Vendor Desk"
      eyebrow="Vendor Sign-in"
      title="The counter is open."
      lede="Sign in to redeem customer codes, view today's ledger, and reconcile your shift. Provider accounts are issued by the Subforme admin team."
      accentClass="text-print-green"
      ruleClass="bg-print-green"
      aside={
        <div className="border-l-2 border-print-green/40 pl-4">
          <p className="font-mono-display text-[11px] uppercase tracking-[0.25em] text-print-green">
            Become a provider
          </p>
          <p className="mt-2 text-sm leading-relaxed">
            Want to list a service on Subforme?{" "}
            <Link to="/vendor/request-listing" className="font-medium text-print-green underline-offset-4 hover:underline">
              Request a listing →
            </Link>
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Or email <span className="font-mono-display">providers@subforme.app</span>.
          </p>
        </div>
      }
    >
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-print-green" />
        <p className="font-mono-display text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
          Section B · Vendor / Provider
        </p>
      </div>
      <h2 className="font-editorial mt-2 text-2xl">Vendor sign in</h2>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="vendorId" className="font-mono-display text-xs uppercase tracking-[0.2em]">
            Vendor ID
          </Label>
          <Input
            id="vendorId"
            type="text"
            autoComplete="username"
            placeholder="SBF-VND-0000"
            value={vendorId}
            onChange={(e) => setVendorId(e.target.value)}
            className="h-12 rounded-none border-2 border-ink bg-paper font-mono-display text-base uppercase tracking-[0.1em] focus-visible:ring-print-green"
          />
          <p className="font-mono-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Issued by Subforme admin · Check your onboarding email
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="font-mono-display text-xs uppercase tracking-[0.2em]">
              Password
            </Label>
            <Link to="/vendor/forgot-password" className="font-mono-display text-[11px] uppercase tracking-[0.2em] text-muted-foreground underline-offset-4 hover:underline">
              Reset?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-none border-2 border-ink bg-paper pr-12 font-mono-display text-base focus-visible:ring-print-green"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-ink"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-none bg-print-green font-mono-display text-sm uppercase tracking-[0.2em] text-secondary-foreground hover:bg-print-green/90"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
            </span>
          ) : (
            <>Open the counter →</>
          )}
        </Button>

        <p className="pt-2 text-center text-sm text-muted-foreground">
          Looking to buy bundles instead?{" "}
          <Link to="/login" className="font-medium text-ink underline-offset-4 hover:underline">
            Customer sign-in →
          </Link>
        </p>
      </form>
    </AuthShell>
  );
};

export default VendorLogin;
