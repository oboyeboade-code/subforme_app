import { ReactNode, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { AppLogo } from "@/components/app/SubformeLogo";
import { MaisonEyebrow, Rule, MonoTag } from "./AdminMaison";
import { PulseDot, BentoCell } from "./AdminMaisonPlus";

interface Props {
  eyebrow: string;
  title: string;
  lede: string;
  aside?: ReactNode;
  children: ReactNode;
}

/* ─────────────────────────────────────────────────────────────
 * AdminAuthShell v5 — "Mission Control · Entry" (quiet cut)
 *
 * Retuned to stop impersonating a running dashboard before sign-in.
 * Removed: fake latency telemetry, "Build · stable" tag, dead footer
 * nav links, the ⌘K hints (palette is post-auth), the shortcuts strip,
 * the duplicate footer clock, the § glyph, and the invented
 * "Sector / Read-write" taxonomy. Kept: the editorial ledger masthead,
 * roman-numeral section markers, and a single restrained trust cue.
 * Props are unchanged so all consumers render without edits.
 * ───────────────────────────────────────────────────────────── */

const greeting = () => {
  const h = new Date().getHours();
  if (h < 5) return "Late hours";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good night";
};

const useClock = () => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
};

const fade = {
  hidden: { opacity: 0, y: 12 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: 0.05 + i * 0.06,
      ease: [0.2, 0.7, 0.2, 1] as const,
    },
  }),
};

const AdminAuthShell = ({ eyebrow, title, lede, aside, children }: Props) => {
  const now = useClock();
  const issue = `Vol. ${now.getFullYear()} · ${now.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  })}`;
  const time = now.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="min-h-screen bg-paper text-ink font-v3 flex flex-col relative overflow-hidden">
      {/* Background plate — same dotted grain as the hub */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
          backgroundSize: "18px 18px",
        }}
      />

      {/* Console masthead — the one editorial clock */}
      <div className="relative border-b border-ink/10 bg-ink/[0.015]">
        <div className="max-w-[1320px] mx-auto px-6 md:px-10 py-2.5 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <PulseDot tone="green" />
            <MaisonEyebrow>Console live</MaisonEyebrow>
          </div>
          <span className="hidden sm:inline h-3 w-px bg-ink/15" />
          <MaisonEyebrow className="hidden sm:inline">{issue}</MaisonEyebrow>
          <MaisonEyebrow className="hidden md:inline text-center flex-1">
            The Subforme Ledger — Admin Edition
          </MaisonEyebrow>
          <MaisonEyebrow className="ml-auto md:ml-0 tabular-nums text-ink/70">
            {time} <span className="text-ink/35">UTC</span>
          </MaisonEyebrow>
        </div>
      </div>

      {/* Logo header */}
      <header className="relative border-b-2 border-ink/15">
        <div className="max-w-[1320px] mx-auto px-6 md:px-10 h-[84px] grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <Link to="/v3" className="flex items-center gap-3 shrink-0">
              <AppLogo />
              <MonoTag tone="red">Admin</MonoTag>
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              to="/v3"
              className="group inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink/55 hover:text-ink transition-colors"
            >
              <span aria-hidden className="transition-transform group-hover:-translate-x-0.5">←</span>
              Customer site
            </Link>
          </div>
        </div>
      </header>

      <main className="relative flex-1">
        <div className="max-w-[1320px] mx-auto px-6 md:px-10 py-10 md:py-14 space-y-10">
          {/* Greeting bar — matches AdminHome */}
          <motion.div
            variants={fade}
            initial="hidden"
            animate="show"
            custom={0}
            className="flex flex-col md:flex-row md:items-end md:justify-between gap-6"
          >
            <div>
              <MaisonEyebrow>{greeting()} · Mission Control</MaisonEyebrow>
              <Rule weight="bold" className="mt-3 mb-5 max-w-[64px]" />
              <h1 className="font-v3-display text-[44px] md:text-[64px] leading-[0.94] tracking-[-0.025em] text-ink max-w-[14ch]">
                {title}
              </h1>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <PulseDot tone="green" />
              <MaisonEyebrow>All systems nominal</MaisonEyebrow>
            </div>
          </motion.div>

          {/* Bento band: editorial column + credential cell */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 auto-rows-[minmax(220px,auto)]">
            {/* Editorial column */}
            <motion.div
              variants={fade}
              initial="hidden"
              animate="show"
              custom={1}
              className="lg:col-span-1"
            >
              <BentoCell className="h-full">
                <div className="flex items-center justify-between mb-5">
                  <MaisonEyebrow>I · Entry</MaisonEyebrow>
                  <MonoTag>{eyebrow}</MonoTag>
                </div>

                <p className="text-base leading-relaxed text-ink/70">{lede}</p>

                {aside && (
                  <>
                    <Rule className="my-6" />
                    <div className="text-ink/70">{aside}</div>
                  </>
                )}

                <Rule className="my-6" />

                {/* Single restrained trust cue */}
                <div className="flex items-center gap-2 rounded-[4px] border border-ink/12 px-3 py-2 w-fit">
                  <Lock className="h-3.5 w-3.5 text-ink/70" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/65">
                    Encrypted
                  </span>
                </div>
              </BentoCell>
            </motion.div>

            {/* Credential column */}
            <motion.div
              variants={fade}
              initial="hidden"
              animate="show"
              custom={2}
              className="lg:col-span-2"
            >
              <div className="relative h-full">
                {/* Corner ticks */}
                <span aria-hidden className="absolute -top-1 -left-1 h-3 w-3 border-l border-t border-ink" />
                <span aria-hidden className="absolute -top-1 -right-1 h-3 w-3 border-r border-t border-ink" />
                <span aria-hidden className="absolute -bottom-1 -left-1 h-3 w-3 border-l border-b border-ink" />
                <span aria-hidden className="absolute -bottom-1 -right-1 h-3 w-3 border-r border-b border-ink" />

                <BentoCell className="h-full bg-paper border border-ink/20 shadow-[0_24px_60px_-32px_rgba(0,0,0,0.25)]">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/45">
                        II
                      </span>
                      <MaisonEyebrow>Credentials</MaisonEyebrow>
                    </div>
                    <MonoTag tone="red">Secure channel</MonoTag>
                  </div>

                  {children}

                  <Rule className="mt-8 mb-4" />
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/40">
                    Authorized personnel only · All sessions are audited.
                  </p>
                </BentoCell>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer — quiet ledger line, no fake telemetry */}
      <footer className="relative border-t-2 border-ink/15 mt-6">
        <div className="max-w-[1320px] mx-auto px-6 md:px-10 py-6">
          <div className="flex items-center gap-3 min-w-0">
            <PulseDot tone="green" />
            <MaisonEyebrow className="truncate">
              <span>
                &copy;{" "}
                <AppLogo inline className="text-sm !normal-case" /> &trade;{" "}
                {new Date().getFullYear()}
              </span>
            </MaisonEyebrow>
          </div>

          <Rule className="mt-5" />
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-ink/40">
            Restricted console · Access logged · v3.mission-control
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AdminAuthShell;
