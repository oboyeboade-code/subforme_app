import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, Loader2, KeyRound } from "lucide-react";
import AdminAuthShell from "@/components/admin/AdminAuthShell";
import { MaisonInput, MaisonButton, MaisonEyebrow, Rule } from "@/components/admin/AdminMaison";
import { useToast } from "@/hooks/use-toast";
import { handleLogin } from "@/lib/auth/loginHandler";
import { useQueryClient } from "@tanstack/react-query";

const AdminLogin = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Missing details",
        description: "Enter both your email and password to continue.",
        variant: "destructive",
      });
      return;
    }
    await handleLogin({
      email,
      password,
      expectedRole: "admin",
      setLoading,
      navigate,
      queryClient,
      successMessage: "Welcome back, Admin",
    });
  };

  return (
    <AdminAuthShell
      eyebrow="Admin · Sign in"
      title="Welcome back."
      lede="Sign in to administer providers, services, voucher codes, and regional admins. Secure access only — every session is recorded."
      aside={
        <div>
          <MaisonEyebrow>Locked out?</MaisonEyebrow>
          <p className="mt-3 text-sm leading-relaxed">
            Recover access via your registered email.{" "}
            <Link
              to="/admin/forgot-password"
              className="font-medium text-ink underline underline-offset-[6px] decoration-ink/30 hover:decoration-ink"
            >
              Reset password →
            </Link>
          </p>
        </div>
      }
    >
      <div className="flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-ink/20">
          <KeyRound className="h-3.5 w-3.5 text-ink/70" />
        </span>
        <MaisonEyebrow>The Admin Portal</MaisonEyebrow>
      </div>

      <h2 className="font-v3-display text-[36px] tracking-[-0.015em] mt-4">Sign in</h2>
      <p className="mt-2 text-sm text-ink/55">Use your admin email and password.</p>
      <Rule className="my-6" />

      <form onSubmit={onSubmit} className="space-y-6">
        <MaisonInput
          name="email"
          type="email"
          label="Admin email"
          placeholder="admin@subforme.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="relative">
          <MaisonInput
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
            className="absolute right-0 top-[34px] text-ink/45 hover:text-ink"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <label className="inline-flex items-center gap-2 cursor-pointer select-none text-xs text-ink/55">
            <input type="checkbox" className="h-3.5 w-3.5 accent-ink" />
            Remember this device
          </label>
          <Link
            to="/admin/forgot-password"
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/55 hover:text-ink border-b border-ink/20 hover:border-ink pb-0.5 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <MaisonButton type="submit" size="lg" fullWidth disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Enter the vault <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </MaisonButton>

        <Rule className="my-4" />

        <p className="text-center font-mono text-[10px] uppercase tracking-[0.18em] text-ink/50">
          Not an admin?{" "}
          <Link
            to="/v3/login"
            className="text-ink border-b border-ink/30 hover:border-ink pb-0.5"
          >
            Customer sign-in →
          </Link>
        </p>
      </form>
    </AdminAuthShell>
  );
};

export default AdminLogin;
