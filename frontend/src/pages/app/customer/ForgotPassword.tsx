import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, CheckCircle2 } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/api/";

const ForgotPassword = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Missing email",
        description: "Enter the email address tied to your account.",
        variant: "destructive",
      });
      return;
    }
    try {
      setLoading(true);
      await authApi.forgotPassword(email);
      setSent(true);
      toast({
        title: "Reset link sent",
        description: "If that email is on file you'll receive a link shortly.",
      });
    } catch (err: any) {
      toast({
        title: "Couldn't send reset link",
        description: err?.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      edition="Vol. I · Customer Desk"
      eyebrow="Reset your password"
      title="Lost the keys to your codes?"
      lede="Enter the email on your account and we'll mail you a single-use link to set a new password. The link expires in 30 minutes — no struggle."
      accentClass="text-print-red"
      ruleClass="bg-print-red"
      aside={
        <div className="border-l-2 border-ink/20 pl-4">
          <p className="font-mono-display text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            Remembered it?
          </p>
          <p className="mt-2 text-sm leading-relaxed">
            <Link to="/login" className="font-medium text-print-red underline-offset-4 hover:underline">
              Back to sign in →
            </Link>
          </p>
        </div>
      }
    >
      <p className="font-mono-display text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
        Section A · Customer · Recovery
      </p>
      <h2 className="font-editorial mt-2 text-2xl">Forgot password</h2>

      {sent ? (
        <div className="mt-8 border-2 border-print-green/60 bg-print-green/5 p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-print-green" />
            <div>
              <p className="font-editorial text-lg">Check your inbox.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                We've sent a reset link to{" "}
                <span className="font-mono-display text-ink">{email}</span>. It expires in 30 minutes.
              </p>
              <p className="mt-3 font-mono-display text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Didn't get it?{" "}
                <button
                  onClick={() => setSent(false)}
                  className="text-print-red underline-offset-4 hover:underline"
                >
                  Try a different email →
                </button>
              </p>
            </div>
          </div>
        </div>
      ) : (
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
              className="h-12 rounded-none border-2 border-ink bg-paper font-mono-display text-base focus-visible:ring-print-red"
            />
          </div>

          <Button
            type="submit"
            className="h-12 w-full rounded-none bg-print-red font-mono-display text-sm uppercase tracking-[0.2em] text-primary-foreground hover:bg-print-red/90"
          >
            <Mail className="mr-2 h-4 w-4" /> Send reset link →
          </Button>

          <p className="pt-2 text-center text-sm text-muted-foreground">
            <Link to="/login" className="font-medium text-ink underline-offset-4 hover:underline">
              ← Back to sign in
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
};

export default ForgotPassword;
