import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useUIVersion } from "@/components/uiversion/UIVersionContext";
import { handleLogin } from "@/lib/auth/loginHandler";
import { useQueryClient } from "@tanstack/react-query";

const Login = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setVersion } = useUIVersion();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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
      setVersion,
      useV3: false,
      queryClient,
      successMessage: "Welcome back",
    });
  };

  return (
    <AuthShell
      edition="Vol. I · Customer Desk"
      eyebrow="Customer Sign-in"
      title="Welcome back to your codes."
      lede="Sign in to view bundles, resend codes, and check what's still unused. Your inbox is the source of truth — this is just for housekeeping."
      accentClass="text-print-red"
      ruleClass="bg-print-red"
      aside={
        <div className="border-l-2 border-ink/20 pl-4">
          <p className="font-mono-display text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            New here?
          </p>
          <p className="mt-2 text-sm leading-relaxed">
            Customers can open an account in under a minute.{" "}
            <Link to="/register" className="font-medium text-print-red underline-offset-4 hover:underline">
              Register as a customer →
            </Link>
          </p>
        </div>
      }
    >
      <div className="mb-5 flex items-center justify-between gap-3 flex-wrap">
        <p className="font-mono-display text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
          Section A · Customer
        </p>
      </div>

      <h2 className="font-editorial text-2xl">Sign in to Subforme</h2>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@inbox.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-sm underline">
              Forgot?
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
              className="pr-12"
            />

            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full h-12" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in →"
          )}
        </Button>

        <div className="flex items-center gap-3 pt-2">
          <span className="h-px flex-1 bg-ink/20" />
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            Or
          </span>
          <span className="h-px flex-1 bg-ink/20" />
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Are you a vendor?{" "}
          <Link to="/vendor-login" className="font-medium underline">
            Use the Vendor Desk →
          </Link>
        </p>
      </form>
    </AuthShell>
  );
};

export default Login;