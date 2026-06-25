import { FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/api/";

const ResetPassword = () => {
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
      toast({ title: "Password too short", description: "Use at least 8 characters.", variant: "destructive" });
      return;
    }
    if (pw !== pw2) {
      toast({ title: "Passwords don't match", description: "Please retype both fields.", variant: "destructive" });
      return;
    }
    try {
      setLoading(true);
      await authApi.resetPassword(token, pw);
      toast({ title: "Password updated", description: "You can sign in with your new password." });
      navigate("/login");
    } catch (err: any) {
      toast({ title: "Couldn't reset password", description: err?.message || "Link may be expired", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      edition="Vol. I · Customer Desk"
      eyebrow="Set a new password"
      title="A fresh key, on the house."
      lede="Choose a new password for your customer account. Make it long, make it memorable — your bundles depend on it."
      accentClass="text-print-red"
      ruleClass="bg-print-red"
      aside={
        <div className="border-l-2 border-ink/20 pl-4">
          <p className="font-mono-display text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            Token
          </p>
          <p className="mt-2 font-mono-display text-xs text-ink/70 break-all">{token}</p>
        </div>
      }
    >
      <p className="font-mono-display text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
        Section A · Customer · New password
      </p>
      <h2 className="font-editorial mt-2 text-2xl">Choose a new password</h2>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="pw" className="font-mono-display text-xs uppercase tracking-[0.2em]">
            New password
          </Label>
          <div className="relative">
            <Input
              id="pw"
              type={show ? "text" : "password"}
              placeholder="••••••••"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className="h-12 rounded-none border-2 border-ink bg-paper pr-12 font-mono-display text-base focus-visible:ring-print-red"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-ink"
            >
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
            placeholder="••••••••"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            className="h-12 rounded-none border-2 border-ink bg-paper font-mono-display text-base focus-visible:ring-print-red"
          />
        </div>

        <Button
          type="submit"
          className="h-12 w-full rounded-none bg-print-red font-mono-display text-sm uppercase tracking-[0.2em] text-primary-foreground hover:bg-print-red/90"
        >
          <KeyRound className="mr-2 h-4 w-4" /> Update password →
        </Button>

        <p className="pt-2 text-center text-sm text-muted-foreground">
          <Link to="/login" className="font-medium text-ink underline-offset-4 hover:underline">
            ← Back to sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
};

export default ResetPassword;
