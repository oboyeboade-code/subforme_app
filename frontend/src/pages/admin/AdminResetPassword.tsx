import { FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import AdminAuthShell from "@/components/admin/AdminAuthShell";
import {
  MaisonInput,
  MaisonButton,
  MaisonEyebrow,
  Rule,
} from "@/components/admin/AdminMaison";
import { toast } from "sonner";

const AdminResetPassword = () => {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [show, setShow] = useState(false);
  const [show2, setShow2] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token") || "demo-token";

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (pw.length < 12) {
      toast.error("Admin passwords need at least 12 characters.");
      return;
    }
    if (pw !== pw2) {
      toast.error("Passwords don't match.");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Admin password updated.");
      navigate("/admin/login");
    }, 800);
  };

  return (
    <AdminAuthShell
      eyebrow="Admin · Reset"
      title="Set a new password."
      lede="Choose a strong, unique passphrase — at least twelve characters. You will be signed back in afterwards."
      aside={
        <div>
          <MaisonEyebrow>Recovery token</MaisonEyebrow>
          <p className="mt-3 font-mono text-xs tracking-[0.08em] text-ink/65 break-all bg-ink/[0.04] border-l-2 border-ink/30 px-3 py-2">
            {token.slice(0, 32)}…
          </p>
        </div>
      }
    >
      <MaisonEyebrow>Set new password</MaisonEyebrow>
      <h2 className="font-v3-display text-[34px] tracking-[-0.01em] mt-3">
        New password
      </h2>
      <p className="mt-2 text-sm text-ink/55">
        At least 12 characters. Mix letters, numbers, and symbols.
      </p>
      <Rule className="my-6" />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <MaisonInput
            name="password"
            type={show ? "text" : "password"}
            label="New password"
            placeholder="At least 12 characters"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
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
        <div className="relative">
          <MaisonInput
            name="confirm"
            type={show2 ? "text" : "password"}
            label="Confirm password"
            placeholder="Repeat your new password"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShow2((s) => !s)}
            className="absolute right-0 top-[34px] text-ink/45 hover:text-ink"
            aria-label={show2 ? "Hide password" : "Show password"}
          >
            {show2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <MaisonButton type="submit" size="lg" fullWidth disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Update password <ArrowRight className="h-3.5 w-3.5" />
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
    </AdminAuthShell>
  );
};

export default AdminResetPassword;
