import { ReactNode, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, Activity } from "lucide-react";
import { AppLogo } from "@/components/app/SubformeLogo";
import { MaisonEyebrow, Rule, MonoTag } from "./AdminMaison";

interface Props {
  eyebrow: string;
  title: string;
  lede: string;
  aside?: ReactNode;
  children: ReactNode;
}

/* ─────────────────────────────────────────────────────────────
 * AdminAuthShell v3 — "Vault"
 * A dark, editorial split surface for authenticated admin entry.
 * Left: typographic identity + live ledger ticks.
 * Right: minimal credential form card.
 * ───────────────────────────────────────────────────────────── */

const useClock = () => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
};

const AdminAuthShell = ({ eyebrow, title, lede, aside, children }: Props) => {
  const now = useClock();
  const issue = `Vol. ${now.getFullYear()} · ${now.toLocaleDateString("en-GB", {
    day: "2-digit", month: "short",
  })}`;
  const time = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <div className="min-h-screen bg-paper text-ink font-v3 flex flex-col relative overflow-hidden">
      {/* Background plate */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
          backgroundSize: "18px 18px",
        }}
      />

      {/* Masthead */}
      <div className="relative border-b border-ink/10">
        <div className="max-w-[1320px] mx-auto px-6 md:px-10 py-3 flex items-center justify-between gap-4">
          <MaisonEyebrow className="hidden sm:inline">{issue}</MaisonEyebrow>
          <MaisonEyebrow className="text-center flex-1 sm:flex-none">
            The Subforme Ledger — Admin Edition
          </MaisonEyebrow>
          <MaisonEyebrow className="hidden sm:inline tabular-nums">{time}</MaisonEyebrow>
        </div>
      </div>

      {/* Logo header */}
      <header className="relative border-b-2 border-ink">
        <div className="max-w-[1320px] mx-auto px-6 md:px-10 h-[72px] flex items-center justify-between gap-4">
          <Link to="/v3" className="flex items-center gap-3">
            <AppLogo />
            <MonoTag tone="red">Admin</MonoTag>
          </Link>
          <Link
            to="/v3"
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/55 hover:text-ink transition-colors"
          >
            ← Customer site
          </Link>
        </div>
      </header>

      <main className="relative flex-1 flex items-stretch">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] } as any}
          className="w-full max-w-[1320px] mx-auto grid lg:grid-cols-[1.2fr_1fr] gap-0 px-6 md:px-10 py-12 md:py-16"
        >
          {/* Editorial vault column */}
          <aside className="relative lg:pr-16 lg:border-r lg:border-ink/10 mb-12 lg:mb-0">
            <MaisonEyebrow>{eyebrow}</MaisonEyebrow>
            <Rule weight="bold" className="mt-4 mb-6 max-w-[64px]" />

            <h1 className="font-v3-display text-[48px] md:text-[68px] leading-[0.94] tracking-[-0.025em] text-ink">
              {title}
            </h1>
            <p className="mt-8 text-base leading-relaxed text-ink/65 max-w-md">{lede}</p>

            {aside && (
              <>
                <Rule className="my-10 max-w-md" />
                <div className="max-w-md text-ink/70">{aside}</div>
              </>
            )}

            {/* Trust strip */}
            <div className="mt-12 max-w-md grid grid-cols-3 gap-3">
              {[
                { icon: ShieldCheck, label: "Audited" },
                { icon: Lock,        label: "Encrypted" },
                { icon: Activity,    label: "Live ledger" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-[4px] border border-ink/12 px-3 py-2"
                >
                  <Icon className="h-3.5 w-3.5 text-ink/70" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/65">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            <Rule className="mt-10 max-w-md" />
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-ink/40">
              Authorized personnel only · All sessions are audited.
            </p>
          </aside>

          {/* Form column */}
          <section className="lg:pl-16 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] } as any}
              className="relative"
            >
              {/* Corner ticks */}
              <span aria-hidden className="absolute -top-1 -left-1 h-3 w-3 border-l border-t border-ink" />
              <span aria-hidden className="absolute -top-1 -right-1 h-3 w-3 border-r border-t border-ink" />
              <span aria-hidden className="absolute -bottom-1 -left-1 h-3 w-3 border-l border-b border-ink" />
              <span aria-hidden className="absolute -bottom-1 -right-1 h-3 w-3 border-r border-b border-ink" />

              <div className="relative bg-paper border border-ink/20 p-8 md:p-10 shadow-[0_24px_60px_-32px_rgba(0,0,0,0.25)]">
                <div className="absolute top-0 left-0 right-0 px-4 -translate-y-1/2 flex justify-between">
                  <MonoTag>Secure</MonoTag>
                  <MonoTag tone="red">Vault</MonoTag>
                </div>
                {children}
              </div>
            </motion.div>
          </section>
        </motion.div>
      </main>

      <footer className="relative border-t border-ink/10">
        <div className="max-w-[1320px] mx-auto px-6 md:px-10 py-5">
          <Rule weight="bold" className="mb-4" />
          <MaisonEyebrow>
            <span>&copy; <AppLogo inline className="text-sm !normal-case" /> &trade; {new Date().getFullYear()}</span>
          </MaisonEyebrow>
        </div>
      </footer>
    </div>
  );
};

export default AdminAuthShell;
