import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import V3AuthShell from "@/components/v3/V3AuthShell";
import { V3Input, V3Button } from "@/components/v3/V3UI";
import { useToast } from "@/hooks/use-toast";
import { handleLogin } from "@/lib/auth/loginHandler";
import { useQueryClient } from "@tanstack/react-query";

const V3VendorLogin = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [vendorId, setVendorId] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!vendorId || !password) {
      toast({
        title: "Missing details",
        description: "Enter vendor ID and password.",
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
      useV3: true,
    });
  };

  return (
    <V3AuthShell
      eyebrow="Vendor · Sign in"
      title="The counter is open."
      lede="Sign in to redeem customer codes, view today's ledger, and reconcile your shift. Provider accounts are issued by the Subforme admin team."
      accent="green"
      aside={
        <div>
          <p className="text-[11px] uppercase tracking-wider opacity-80">
            Become a provider
          </p>
          <p className="mt-2 text-sm text-paper/90">
            Want to list a service on Subforme?{" "}
            <Link
              to="/v3/vendor/request-listing"
              className="underline underline-offset-4"
            >
              Request a listing →
            </Link>
          </p>
          <p className="mt-2 text-xs text-paper/70">
            Or email{" "}
            <span className="font-mono text-paper">
              providers@subforme.app
            </span>
            .
          </p>
        </div>
      }
    >
      <div className="flex items-center gap-2 text-sm font-medium text-print-green">
        <ShieldCheck className="h-4 w-4" />
        Section B · Vendor / Provider
      </div>

      <h2 className="font-v3-display mt-2 text-3xl">
        Vendor sign in
      </h2>

      <p className="mt-2 text-ink/60 text-sm">
        Issued vendor IDs only.
      </p>

      <form onSubmit={onSubmit} className="mt-7 space-y-4">
        <V3Input
          name="vendorId"
          label="Vendor ID"
          placeholder="SBF-VND-0000"
          value={vendorId}
          onChange={(e) => setVendorId(e.target.value)}
          className="uppercase tracking-wider font-mono"
          hint="Issued by Subforme admin · check your onboarding email"
        />

        <div className="relative">
          <V3Input
            name="password"
            type={show ? "text" : "password"}
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-[36px] text-ink/50"
          >
            {show ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        <Link
          to="/v3/vendor/forgot-password"
          className="block text-right text-xs text-ink/55 hover:text-print-green"
        >
          Forgot password?
        </Link>

        <V3Button type="submit" size="lg" fullWidth disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Opening counter...
            </>
          ) : (
            <>
              Open the counter <ArrowRight className="h-4 w-4" />
            </>
          )}
        </V3Button>

        <p className="pt-1 text-center text-sm text-ink/65">
          Customer?{" "}
          <Link
            to="/v3/login"
            className="font-semibold text-ink underline underline-offset-4"
          >
            Customer sign-in →
          </Link>
        </p>
      </form>
    </V3AuthShell>
  );
};

export default V3VendorLogin;