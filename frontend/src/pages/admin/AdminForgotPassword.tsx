import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import AdminAuthShell from "@/components/admin/AdminAuthShell";
import {
  MaisonInput,
  MaisonButton,
  MaisonEyebrow,
  Rule,
} from "@/components/admin/AdminMaison";
import { toast } from "sonner";

const AdminForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Enter the admin email on file.");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSent(true);
      toast.success("Recovery email queued.");
    }, 800);
  };

  return (
    <AdminAuthShell
      eyebrow="Admin · Recovery"
      title="Reset your password."
      lede="We will email a one-time link to your registered admin address. The link expires in thirty minutes."
      aside={
        <div>
          <MaisonEyebrow>Remembered it?</MaisonEyebrow>
          <p className="mt-3 text-sm leading-relaxed">
            Head back to sign in.{" "}
            <Link
              to="/admin/login"
              className="font-medium text-ink underline underline-offset-[6px] decoration-ink/30 hover:decoration-ink"
            >
              Admin sign-in →
            </Link>
          </p>
        </div>
      }
    >
      <MaisonEyebrow>Account recovery</MaisonEyebrow>
      <h2 className="font-v3-display text-[34px] tracking-[-0.01em] mt-3">
        Forgot password
      </h2>
      <p className="mt-2 text-sm text-ink/55">
        Enter the email tied to your admin account.
      </p>
      <Rule className="my-6" />

      {sent ? (
        <div className="border border-print-green/30 p-6 bg-print-green/[0.04]">
          <CheckCircle2 className="h-5 w-5 text-print-green mb-3" />
          <MaisonEyebrow className="text-print-green">Link sent</MaisonEyebrow>
          <p className="font-v3-display text-2xl tracking-[-0.01em] mt-2">
            Check your inbox.
          </p>
          <p className="mt-3 text-sm text-ink/65 leading-relaxed">
            If <span className="font-medium text-ink">{email}</span> is
            registered, you will receive a recovery link shortly. It expires in
            thirty minutes.
          </p>
          <Rule className="my-6" />
          <MaisonButton
            type="button"
            variant="ghost"
            fullWidth
            onClick={() => navigate("/admin/login")}
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
          </MaisonButton>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <MaisonInput
            name="email"
            type="email"
            label="Admin email"
            placeholder="admin@subforme.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <MaisonButton
            type="submit"
            size="lg"
            fullWidth
            disabled={isLoading}
          >
            {isLoading ? "Sending…" : (
              <>
                Send reset link <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </MaisonButton>

          <Rule className="my-4" />

          <p className="text-center font-mono text-[10px] uppercase tracking-[0.18em] text-ink/50">
            <Link
              to="/admin/login"
              className="text-ink border-b border-ink/30 hover:border-ink pb-0.5"
            >
              ← Back to admin sign in
            </Link>
          </p>
        </form>
      )}
    </AdminAuthShell>
  );
};

export default AdminForgotPassword;
