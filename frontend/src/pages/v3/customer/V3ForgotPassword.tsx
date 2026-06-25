import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import V3AuthShell from "@/components/v3/V3AuthShell";
import { V3Input, V3Button } from "@/components/v3/V3UI";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/api/";

const V3ForgotPassword = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: "Missing email", variant: "destructive" });
      return;
    }
    try {
      setLoading(true);
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err: any) {
      toast({ title: "Couldn't send reset link", description: err?.message || "Try again", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <V3AuthShell
      eyebrow="Customer · Reset"
      title="Forgot your password?"
      lede="Drop your email below and we'll send you a one-time reset link. It expires in 30 minutes — no struggle."
      accent="red"
      aside={
        <div>
          <p className="text-[11px] uppercase tracking-wider opacity-80">Need an account?</p>
          <p className="mt-2 text-sm text-paper/90">
            <Link to="/v3/register" className="underline underline-offset-4">
              Create one in under a minute →
            </Link>
          </p>
        </div>
      }
    >
      <h2 className="font-v3-display text-3xl">Reset password</h2>
      <p className="mt-2 text-ink/60 text-sm">We'll mail a link to your inbox.</p>

      {sent ? (
        <div className="mt-7 rounded-2xl border border-print-green/30 bg-print-green/5 p-5">
          <CheckCircle2 className="h-6 w-6 text-print-green mb-2" />
          <p className="font-v3-display text-lg">Check your inbox</p>
          <p className="mt-1 text-sm text-ink/70">
            If <span className="font-medium text-ink">{email}</span> is on file you'll see a reset link shortly.
          </p>
          <V3Button variant="ghost" fullWidth className="mt-5" onClick={() => setSent(false)}>
            <ArrowLeft className="h-4 w-4" /> Try a different email
          </V3Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-7 space-y-4">
          <V3Input
            name="email"
            label="Email address"
            type="email"
            placeholder="you@inbox.com"
            icon={<Mail className="h-4 w-4" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <V3Button type="submit" size="lg" fullWidth disabled={loading}>
            {loading ? "Sending…" : <>Send reset link <ArrowRight className="h-4 w-4" /></>}
          </V3Button>
          <p className="pt-1 text-center text-sm text-ink/65">
            Remembered it?{" "}
            <Link to="/v3/login" className="font-semibold text-ink underline underline-offset-4">
              Back to sign in →
            </Link>
          </p>
        </form>
      )}
    </V3AuthShell>
  );
};

export default V3ForgotPassword;
