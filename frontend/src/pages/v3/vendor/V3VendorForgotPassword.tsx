import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import V3AuthShell from "@/components/v3/V3AuthShell";
import { V3Input, V3Button } from "@/components/v3/V3UI";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/api/";

const V3VendorForgotPassword = () => {
  const { toast } = useToast();
  const [vendorId, setVendorId] = useState("");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!vendorId || !email) {
      toast({ title: "Missing details", variant: "destructive" });
      return;
    }
    try {
      setLoading(true);
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err: any) {
      toast({ title: "Couldn't send reset", description: err?.message || "Try again", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <V3AuthShell
      eyebrow="Vendor · Reset"
      title="Locked out of the counter?"
      lede="Vendor resets are routed through admin. Confirm your vendor ID and the email on file — we'll mail a one-time link."
      accent="green"
      aside={
        <div>
          <p className="text-[11px] uppercase tracking-wider opacity-80">Need help?</p>
          <p className="mt-2 text-sm text-paper/90">
            Email <span className="font-mono text-paper">providers@subforme.app</span> if your vendor ID isn't on hand.
          </p>
        </div>
      }
    >
      <div className="flex items-center gap-2 text-sm font-medium text-print-green">
        <ShieldCheck className="h-4 w-4" /> Vendor recovery
      </div>
      <h2 className="font-v3-display mt-2 text-3xl">Reset vendor password</h2>

      {sent ? (
        <div className="mt-7 rounded-2xl border border-print-green/30 bg-print-green/5 p-5">
          <CheckCircle2 className="h-6 w-6 text-print-green mb-2" />
          <p className="font-v3-display text-lg">Reset link queued</p>
          <p className="mt-1 text-sm text-ink/70">
            If <span className="font-medium text-ink">{vendorId}</span> matches our records, an email is on its way to{" "}
            <span className="font-medium text-ink">{email}</span>.
          </p>
          <V3Button variant="ghost" fullWidth className="mt-5" onClick={() => setSent(false)}>
            <ArrowLeft className="h-4 w-4" /> Re-enter details
          </V3Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-7 space-y-4">
          <V3Input
            name="vendorId"
            label="Vendor ID"
            placeholder="SBF-VND-0000"
            value={vendorId}
            onChange={(e) => setVendorId(e.target.value)}
            className="uppercase tracking-wider font-mono"
          />
          <V3Input
            name="email"
            label="Email on file"
            type="email"
            placeholder="counter@yourshop.com"
            icon={<Mail className="h-4 w-4" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <V3Button type="submit" size="lg" fullWidth>
            Request reset link <ArrowRight className="h-4 w-4" />
          </V3Button>

          <p className="pt-1 text-center text-sm text-ink/65">
            <Link to="/v3/vendor-login" className="font-semibold text-ink underline underline-offset-4">
              ← Back to vendor sign in
            </Link>
          </p>
        </form>
      )}
    </V3AuthShell>
  );
};

export default V3VendorForgotPassword;
