import { FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import V3AuthShell from "@/components/v3/V3AuthShell";
import { V3Input, V3Button } from "@/components/v3/V3UI";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/api/";

const V3VendorResetPassword = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token") || "demo-token";
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (pw.length < 10) {
      toast({ title: "Stronger, please", description: "At least 10 characters for vendor accounts.", variant: "destructive" });
      return;
    }
    if (pw !== pw2) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    try {
      setLoading(true);
      await authApi.resetPassword(token, pw);
      toast({ title: "Counter unlocked", description: "Sign in with your new password." });
      navigate("/v3/vendor-login");
    } catch (err: any) {
      toast({ title: "Couldn't reset password", description: err?.message || "Link may be expired", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <V3AuthShell
      eyebrow="Vendor · New password"
      title="Cut a new key for the counter."
      lede="Set a new password for your vendor account. We recommend a passphrase — long, weird, and memorable."
      accent="green"
      aside={
        <div>
          <p className="text-[11px] uppercase tracking-wider opacity-80">Reset token</p>
          <p className="mt-2 text-sm text-paper/90 font-mono break-all">{token}</p>
        </div>
      }
    >
      <div className="flex items-center gap-2 text-sm font-medium text-print-green">
        <ShieldCheck className="h-4 w-4" /> Vendor · New password
      </div>
      <h2 className="font-v3-display mt-2 text-3xl">Set vendor password</h2>

      <form onSubmit={onSubmit} className="mt-7 space-y-4">
        <div className="relative">
          <V3Input
            name="pw"
            label="New password"
            type={show ? "text" : "password"}
            placeholder="••••••••••"
            icon={<Lock className="h-4 w-4" />}
            value={pw}
            onChange={(e) => setPw(e.target.value)}
          />
          <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-[36px] text-ink/50 hover:text-ink">
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <V3Input
          name="pw2"
          label="Confirm password"
          type={show ? "text" : "password"}
          placeholder="••••••••••"
          icon={<Lock className="h-4 w-4" />}
          value={pw2}
          onChange={(e) => setPw2(e.target.value)}
        />

        <V3Button type="submit" size="lg" fullWidth disabled={loading}>
          {loading ? "Updating…" : <>Update password <ArrowRight className="h-4 w-4" /></>}
        </V3Button>

        <p className="pt-1 text-center text-sm text-ink/65">
          <Link to="/v3/vendor-login" className="font-semibold text-ink underline underline-offset-4">
            ← Back to vendor sign in
          </Link>
        </p>
      </form>
    </V3AuthShell>
  );
};

export default V3VendorResetPassword;
