import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Eye, EyeOff, Check, ArrowRight } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import { handleRegister } from "@/lib/auth/registerHandler";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordChecks = [
    { label: "At least 8 characters", ok: password.length >= 8 },
    { label: "One number", ok: /\d/.test(password) },
    { label: "Passwords match", ok: password.length > 0 && password === confirm },
  ];

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email || !password || !confirm) {
      toast({
        title: "Missing details",
        description: "Fill in your email and both password fields.",
        variant: "destructive",
      });
      return;
    }

    if (!passwordChecks.every((c) => c.ok)) {
      toast({
        title: "Password not ready",
        description: "Make sure all password requirements are green before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirm) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    await handleRegister({
      payload: {
        email,
        password,
        name: email.split("@")[0], 
        role: "customer",
      },
      setLoading,
      navigate,
      successMessage: "Account created successfully",
      redirectTo: "/login",
    });
  };

  return (
    <AuthShell
      edition="Vol. I · New Subscriber"
      eyebrow="Customer Register"
      title="Open a Subforme account."
      lede="Customers only — providers are onboarded by our admin team. All you need is an email and a password. Codes will be delivered straight to your inbox."
      accentClass="text-print-orange"
      ruleClass="bg-print-orange"
      aside={
        <div className="space-y-4 border-l-2 border-print-orange/40 pl-4">
          <div>
            <p className="font-mono-display text-[11px] uppercase tracking-[0.25em] text-print-orange">
              What you get
            </p>
            <ul className="mt-2 space-y-1 text-sm leading-relaxed">
              <li>· Buy prepaid bundles from your favourite vendors</li>
              <li>· Single-use codes delivered by email in under 2 minutes</li>
              <li>· No transfers, no anxiety, no struggle at checkout</li>
            </ul>
          </div>
          <p className="font-mono-display text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            Already a customer?{" "}
            <Link to="/login" className="text-ink underline-offset-4 hover:underline">
              Sign in →
            </Link>
          </p>
        </div>
      }
    >
      <p className="font-mono-display text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
        Section C · Register
      </p>
      <h2 className="font-editorial mt-2 text-2xl">Create your customer account</h2>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="font-mono-display text-xs uppercase tracking-[0.2em]">
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@inbox.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 rounded-none border-2 border-ink bg-paper font-mono-display text-base focus-visible:ring-print-orange"
          />
          <p className="font-mono-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Codes are sent here · Use an inbox you check often
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="font-mono-display text-xs uppercase tracking-[0.2em]">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-none border-2 border-ink bg-paper pr-12 font-mono-display text-base focus-visible:ring-print-orange"
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

        <div className="space-y-2">
          <Label htmlFor="confirm" className="font-mono-display text-xs uppercase tracking-[0.2em]">
            Confirm password
          </Label>
          <Input
            id="confirm"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="••••••••"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="h-12 rounded-none border-2 border-ink bg-paper font-mono-display text-base focus-visible:ring-print-orange"
          />
        </div>

        <ul className="space-y-1 border border-dashed border-ink/30 bg-paper-deep p-3">
          {passwordChecks.map((c) => (
            <li
              key={c.label}
              className={`flex items-center gap-2 font-mono-display text-[11px] uppercase tracking-[0.18em] ${
                c.ok ? "text-print-green" : "text-muted-foreground"
              }`}
            >
              <Check className={`h-3.5 w-3.5 ${c.ok ? "opacity-100" : "opacity-30"}`} />
              {c.label}
            </li>
          ))}
        </ul>

        <Button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-none bg-print-orange font-mono-display text-sm uppercase tracking-[0.2em] text-accent-foreground hover:bg-print-orange/90 flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Create account <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>

        <p className="pt-2 text-center text-sm text-muted-foreground">
          By registering you agree to Subforme's terms · Single-use, no cash refunds in v1.
        </p>
      </form>
    </AuthShell>
  );
};

export default Register;
