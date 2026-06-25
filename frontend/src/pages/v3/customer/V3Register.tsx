import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Eye, EyeOff, Check, ArrowRight } from "lucide-react";

import V3AuthShell from "@/components/v3/V3AuthShell";
import { V3Input, V3Button } from "@/components/v3/V3UI";

import { handleRegister } from "@/lib/auth/registerHandler";
import { useToast } from "@/hooks/use-toast";

const V3Register = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const checks = [
    { label: "At least 8 characters", ok: password.length >= 8 },
    { label: "One number", ok: /\d/.test(password) },
    { label: "Passwords match", ok: password.length > 0 && password === confirm },
  ];

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email || !password || !confirm) {
      toast({
        title: "Missing details",
        description: "Fill all fields.",
        variant: "destructive",
      });
      return;
    }

    const passwordChecks = [
      password.length >= 8,
      /\d/.test(password),
      password === confirm,
    ];

    if (!passwordChecks.every(Boolean)) {
      toast({
        title: "Password not ready",
        description: "All checks must pass.",
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
      redirectTo: "/v3/login",
    });
  };

  return (
    <V3AuthShell
      eyebrow="Customer · Register"
      title="Open a Subforme account."
      lede="Customers only — providers are onboarded by our admin team. All you need is an email and a password. Codes will be delivered straight to your inbox."
      accent="orange"
      aside={
        <div className="space-y-3">
          <ul className="space-y-1.5 text-sm text-paper/90">
            <li>· Buy prepaid bundles</li>
            <li>· Single-use codes by email in &lt; 2 min</li>
            <li>· No transfers, no struggle</li>
          </ul>
          <p className="text-[11px] uppercase tracking-wider opacity-80 pt-2">
            Already a customer?{" "}
            <Link to="/v3/login" className="font-semibold underline underline-offset-4">
              Sign in →
            </Link>
          </p>
        </div>
      }
    >
      <p className="text-sm font-medium text-print-red">Section C · Register</p>
      <h2 className="font-v3-display mt-2 text-3xl">Create account</h2>
      <p className="mt-2 text-ink/60 text-sm">Takes under a minute.</p>

      <form onSubmit={onSubmit} className="mt-7 space-y-4">
        <V3Input
          name="email"
          type="email"
          label="Email"
          placeholder="you@inbox.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          hint="Codes are sent here · use an inbox you check often"
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
          <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-[36px] text-ink/50">
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <V3Input
          name="confirm"
          type={show ? "text" : "password"}
          label="Confirm password"
          placeholder="••••••••"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        <ul className="space-y-1.5 rounded-xl border border-dashed border-ink/15 bg-ink/[0.02] p-3">
          {checks.map((c) => (
            <li
              key={c.label}
              className={`flex items-center gap-2 text-xs ${c.ok ? "text-print-green" : "text-ink/40"}`}
            >
              <Check className={`h-3.5 w-3.5 ${c.ok ? "opacity-100" : "opacity-30"}`} strokeWidth={3} />
              {c.label}
            </li>
          ))}
        </ul>

        <V3Button type="submit" size="lg" fullWidth disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Create account <ArrowRight className="h-4 w-4" />
            </>
          )}
        </V3Button>

        <p className="pt-1 text-center text-xs text-ink/55">
          By registering you agree to Subforme's terms.
        </p>
      </form>
    </V3AuthShell>
  );
};

export default V3Register;
