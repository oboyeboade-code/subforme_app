import { FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, KeyRound, ShieldCheck } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/api/";

const VendorResetPassword = () => {
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
      toast({ title: "Stronger, please", description: "Vendor passwords must be at least 10 characters.", variant: "destructive" });
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
      navigate("/vendor-login");
    } catch (err: any) {
      toast({ title: "Couldn't reset password", description: err?.message || "Link may be expired", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      edition="Vol. I · Vendor Desk"
      eyebrow="Vendor · New password"
      title="Cut a new key for the counter."
      lede="Set a new password for your vendor account. We recommend a passphrase — long, weird, and memorable."
      accentClass="text-print-green"
      ruleClass="bg-print-green"
      aside={
        <div className="border-l-2 border-print-green/40 pl-4">
          <p className="font-mono-display text-[11px] uppercase tracking-[0.25em] text-print-green">
            Token
          </p>
          <p className="mt-2 font-mono-display text-xs text-ink/70 break-all">{token}</p>
        </div>
      }
    >
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-print-green" />
        <p className="font-mono-display text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
          Section B · Vendor · New password
        </p>
      </div>
      <h2 className="font-editorial mt-2 text-2xl">Set vendor password</h2>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="pw" className="font-mono-display text-xs uppercase tracking-[0.2em]">
            New password
          </Label>
          <div className="relative">
            <Input
              id="pw"
              type={show ? "text" : "password"}
              placeholder="••••••••••"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className="h-12 rounded-none border-2 border-ink bg-paper pr-12 font-mono-display text-base focus-visible:ring-print-green"
            />
            <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-ink">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pw2" className="font-mono-display text-xs uppercase tracking-[0.2em]">
            Confirm password
          </Label>
          <Input
            id="pw2"
            type={show ? "text" : "password"}
            placeholder="••••••••••"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            className="h-12 rounded-none border-2 border-ink bg-paper font-mono-display text-base focus-visible:ring-print-green"
          />
        </div>

        <Button type="submit" className="h-12 w-full rounded-none bg-print-green font-mono-display text-sm uppercase tracking-[0.2em] text-secondary-foreground hover:bg-print-green/90">
          <KeyRound className="mr-2 h-4 w-4" /> Update password →
        </Button>

        <p className="pt-2 text-center text-sm text-muted-foreground">
          <Link to="/vendor-login" className="font-medium text-ink underline-offset-4 hover:underline">
            ← Back to vendor sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
};

export default VendorResetPassword;
