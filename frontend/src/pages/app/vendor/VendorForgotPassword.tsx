import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, CheckCircle2, ShieldCheck } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/api/";

const VendorForgotPassword = () => {
  const { toast } = useToast();
  const [vendorId, setVendorId] = useState("");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!vendorId || !email) {
      toast({
        title: "Missing details",
        description: "We need both your vendor ID and the email on file.",
        variant: "destructive",
      });
      return;
    }
    try {
      setLoading(true);
      await authApi.forgotPassword(email);
      setSent(true);
      toast({ title: "Reset request received", description: "Admin will email a one-time link." });
    } catch (err: any) {
      toast({ title: "Couldn't send reset", description: err?.message || "Try again", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      edition="Vol. I · Vendor Desk"
      eyebrow="Vendor · Reset"
      title="Locked out of the counter?"
      lede="Vendor resets are routed through the admin desk. Confirm your vendor ID and the email on your onboarding sheet — we'll mail you a one-time link."
      accentClass="text-print-green"
      ruleClass="bg-print-green"
      aside={
        <div className="border-l-2 border-print-green/40 pl-4">
          <p className="font-mono-display text-[11px] uppercase tracking-[0.25em] text-print-green">
            Need help?
          </p>
          <p className="mt-2 text-sm leading-relaxed">
            Reach <span className="font-mono-display">providers@subforme.app</span> if your vendor ID isn't on hand.
          </p>
        </div>
      }
    >
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-print-green" />
        <p className="font-mono-display text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
          Section B · Vendor · Recovery
        </p>
      </div>
      <h2 className="font-editorial mt-2 text-2xl">Vendor password reset</h2>

      {sent ? (
        <div className="mt-8 border-2 border-print-green/60 bg-print-green/5 p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-print-green" />
            <div>
              <p className="font-editorial text-lg">Reset link queued.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                If <span className="font-mono-display text-ink">{vendorId}</span> matches our records,
                an email is on its way to <span className="font-mono-display text-ink">{email}</span>.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="vendorId" className="font-mono-display text-xs uppercase tracking-[0.2em]">
              Vendor ID
            </Label>
            <Input
              id="vendorId"
              type="text"
              placeholder="SBF-VND-0000"
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              className="h-12 rounded-none border-2 border-ink bg-paper font-mono-display text-base uppercase tracking-[0.1em] focus-visible:ring-print-green"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="font-mono-display text-xs uppercase tracking-[0.2em]">
              Email on file
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="counter@yourshop.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-none border-2 border-ink bg-paper font-mono-display text-base focus-visible:ring-print-green"
            />
          </div>

          <Button
            type="submit"
            className="h-12 w-full rounded-none bg-print-green font-mono-display text-sm uppercase tracking-[0.2em] text-secondary-foreground hover:bg-print-green/90"
          >
            <Mail className="mr-2 h-4 w-4" /> Request reset link →
          </Button>

          <p className="pt-2 text-center text-sm text-muted-foreground">
            <Link to="/vendor-login" className="font-medium text-ink underline-offset-4 hover:underline">
              ← Back to vendor sign in
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
};

export default VendorForgotPassword;
