import { useState } from "react";
import { cn } from "@/lib/utils";

const Verify = () => {
  const [auth, setAuth] = useState("");
  const [serv, setServ] = useState("");
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const verify = () => {
    if (!auth.trim() || !serv.trim()) {
      setResult({ ok: false, msg: "Please fill both fields" });
      return;
    }
    if (auth === "AUTH123" && serv === "SERV456") {
      setResult({ ok: true, msg: "Valid · ready to use" });
    } else {
      setResult({ ok: false, msg: "Invalid code" });
    }
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-10">
      <header className="pb-6 border-b-2 border-ink mb-8">
        <p className="font-mono-display text-[10px] uppercase tracking-[0.2em] text-print-red mb-2">
          Validity check
        </p>
        <h1 className="font-editorial text-4xl text-ink">Verify voucher</h1>
      </header>

      <div className="space-y-5">
        <Field label="Auth code">
          <input
            value={auth}
            onChange={(e) => setAuth(e.target.value)}
            placeholder="AUTH-XXXXX"
            className={inputCls}
          />
        </Field>
        <Field label="Service code">
          <input
            value={serv}
            onChange={(e) => setServ(e.target.value)}
            placeholder="SERV-XXXXX"
            className={inputCls}
          />
        </Field>

        <button
          onClick={verify}
          className="w-full bg-print-red text-primary-foreground border-2 border-ink py-4 font-mono-display text-sm uppercase tracking-[0.2em] hover:bg-print-red/90 transition-colors"
        >
          Verify
        </button>

        {result && (
          <div
            className={cn(
              "border-2 border-ink p-4 font-mono-display text-sm uppercase tracking-wider",
              result.ok
                ? "bg-print-green text-secondary-foreground"
                : "bg-destructive text-destructive-foreground",
            )}
          >
            {result.ok ? "✓ " : "✗ "} {result.msg}
          </div>
        )}
      </div>
    </div>
  );
};

const inputCls =
  "w-full border-2 border-ink bg-card px-3 py-2.5 font-mono-display text-sm text-ink outline-none focus:bg-paper";

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="font-mono-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground block mb-1.5">
      {label}
    </span>
    {children}
  </label>
);

export default Verify;
