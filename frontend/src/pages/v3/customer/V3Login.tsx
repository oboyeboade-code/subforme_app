import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import V3AuthShell from "@/components/v3/V3AuthShell";
import { V3Input, V3Button } from "@/components/v3/V3UI";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { handleLogin } from "@/lib/auth/loginHandler";
import { useQueryClient } from "@tanstack/react-query";
import { useUIVersion } from "@/components/uiversion/UIVersionContext";

const V3Login = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setVersion } = useUIVersion();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Missing details",
        description: "Enter both your email and password to continue.",
        variant: "destructive",
      });
      return;
    }
    handleLogin({
      email,
      password,
      expectedRole: "customer",
      setLoading,
      navigate,
      queryClient,
      successMessage: "Welcome back",
      setVersion,
      useV3: true,
    });
  };

  return (
    <V3AuthShell
      eyebrow="Customer · Sign in"
      title="Welcome back to Subforme."
      lede="Sign in to view bundles, resend codes, and check what's still unused. Your inbox is the source of truth — this is just for housekeeping."
      accent="red"
      aside={
        <div>
          <p className="text-[11px] uppercase tracking-wider opacity-70">New here?</p>
          <p className="mt-2 text-sm">
            Open an account in under a minute.{" "}
            <Link to="/v3/register" className="font-semibold underline underline-offset-4">
              Register →
            </Link>
          </p>
        </div>
      }
    >
      <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm font-medium text-print-red">Section A · Customer</p>
      </div>
      <h2 className="font-v3-display text-3xl">Sign in</h2>
      <p className="mt-2 text-ink/60 text-sm">Use your email and password.</p>

      <form onSubmit={onSubmit} className="mt-7 space-y-4">
        <V3Input
          name="email"
          type="email"
          label="Email address"
          placeholder="you@inbox.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
            className="absolute right-3 top-[36px] text-ink/50 hover:text-ink"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <Link to="/v3/forgot-password" className="block text-right text-xs text-ink/55 hover:text-print-red">
          Forgot password?
        </Link>

        <V3Button
          type="submit"
          size="lg"
          fullWidth
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Sign in <ArrowRight className="h-4 w-4" />
            </>
          )}
        </V3Button>

        <div className="flex items-center gap-3 pt-1">
          <span className="h-px flex-1 bg-ink/10" />
          <span className="text-[11px] uppercase tracking-wider text-ink/45">or</span>
          <span className="h-px flex-1 bg-ink/10" />
        </div>

        <p className="text-center text-sm text-ink/65">
          Vendor?{" "}
          <Link to="/v3/vendor-login" className="font-semibold text-ink underline underline-offset-4">
            Vendor sign-in →
          </Link>
        </p>
      </form>
    </V3AuthShell>
  );
};

export default V3Login;
