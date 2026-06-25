import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, ShieldCheck } from "lucide-react";
import { V3Card, V3Input, V3Button, V3Pill } from "@/components/v3/V3UI";
import { cn } from "@/lib/utils";

const V3Verify = () => {
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
    <div className="max-w-2xl mx-auto px-5 md:px-8 py-10 md:py-14">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <V3Card className="p-7 md:p-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="h-10 w-10 rounded-2xl bg-gradient-to-br from-print-red to-print-orange text-paper flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <V3Pill tone="red">Validity check</V3Pill>
          </div>
          <h1 className="font-v3-display text-3xl md:text-4xl tracking-tight mb-7">
            Verify voucher
          </h1>

          <div className="space-y-4">
            <V3Input
              name="auth"
              label="Auth code"
              placeholder="AUTH-XXXXX"
              value={auth}
              onChange={(e) => setAuth(e.target.value)}
            />
            <V3Input
              name="serv"
              label="Service code"
              placeholder="SERV-XXXXX"
              value={serv}
              onChange={(e) => setServ(e.target.value)}
            />

            <V3Button onClick={verify} size="lg" fullWidth>Verify</V3Button>

            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  className={cn(
                    "rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2.5",
                    result.ok
                      ? "bg-print-green/10 text-print-green border border-print-green/25"
                      : "bg-print-red/10 text-print-red border border-print-red/25",
                  )}
                >
                  {result.ok ? <Check className="h-4 w-4" strokeWidth={3} /> : <X className="h-4 w-4" strokeWidth={3} />}
                  {result.msg}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </V3Card>
      </motion.div>
    </div>
  );
};

export default V3Verify;
