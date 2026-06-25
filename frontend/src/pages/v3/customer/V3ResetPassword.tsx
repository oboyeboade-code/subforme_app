import { FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import V3AuthShell from "@/components/v3/V3AuthShell";
import { V3Input, V3Button } from "@/components/v3/V3UI";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/api/";

const V3ResetPassword = () => {
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
    if (pw.length < 8) {
      toast({ title: "Password too short", description: "At least 8 characters.", variant: "destructive" });
      return;
    }
    if (pw !== pw2) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    try {
      setLoading(true);
      await authApi.resetPassword(token, pw);
      toast({ title: "Password updated", description: "Sign in with your new password." });
      navigate("/v3/login");
    } catch (err: any) {
      toast({ title: "Couldn't reset password", description: err?.message || "Link may be expired", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <V3AuthShell
      eyebrow="Customer · New password"
      title="Choose a new password."
      lede="Make it long, make it memorable. Your bundles depend on it."
      accent="red"
      aside={
        <div>
          <p className="text-[11px] uppercase tracking-wider opacity-80">Reset token</p>
          <p className="mt-2 text-sm text-paper/90 font-mono break-all">{token}</p>
        </div>
      }
    >
      <h2 className="font-v3-display text-3xl">New password</h2>
      <p className="mt-2 text-ink/60 text-sm">At least 8 characters.</p>

      <form onSubmit={onSubmit} className="mt-7 space-y-4">
        <div className="relative">
          <V3Input
            name="pw"
            label="New password"
            type={show ? "text" : "password"}
            placeholder="••••••••"
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
          placeholder="••••••••"
          icon={<Lock className="h-4 w-4" />}
          value={pw2}
          onChange={(e) => setPw2(e.target.value)}
        />

        <V3Button type="submit" size="lg" fullWidth disabled={loading}>
          {loading ? "Updating…" : <>Update password <ArrowRight className="h-4 w-4" /></>}
        </V3Button>

        <p className="pt-1 text-center text-sm text-ink/65">
          <Link to="/v3/login" className="font-semibold text-ink underline underline-offset-4">
            ← Back to sign in
          </Link>
        </p>
      </form>
    </V3AuthShell>
  );
};

export default V3ResetPassword;
