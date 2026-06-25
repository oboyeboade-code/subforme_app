import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { V3AppLogo } from "./V3SubformeLogo";

interface Props {
  eyebrow: string;
  title: string;
  lede: string;
  accent?: "red" | "orange" | "green";
  aside: ReactNode;
  children: ReactNode;
}

const accentMap = {
  red: "from-print-red to-print-orange",
  orange: "from-print-orange to-print-red",
  green: "from-print-green to-print-orange",
};

const V3AuthShell = ({ eyebrow, title, lede, accent = "red", aside, children }: Props) => {
  return (
    <div className="min-h-screen v3-bg text-ink font-v3 flex flex-col">

      <header className="border-b border-ink/5 bg-paper/70 backdrop-blur">
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
          <Link to="/v3" className="flex items-center gap-2">
            <V3AppLogo />
          </Link>
          {/* <span className="text-xs text-ink/50">{eyebrow}</span> */}
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-5 md:px-8 py-10 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] } as any}
          className="w-full max-w-5xl grid md:grid-cols-2 gap-6"
        >

          <div className={`relative overflow-hidden rounded-[24px] p-9 md:p-11 text-paper bg-gradient-to-br ${accentMap[accent]} flex flex-col justify-between min-h-[420px]`}>
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 60%, white 1px, transparent 1px)",
                backgroundSize: "40px 40px, 32px 32px",
              }}
            />
            <div className="relative">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-paper/15 backdrop-blur border border-paper/25 px-3 py-1 text-[11px] font-medium">
                {eyebrow}
              </span>
              <h1 className="font-v3-display mt-5 text-4xl md:text-5xl tracking-tight leading-[1.05]">
                {title}
              </h1>
              <p className="mt-5 text-[15px] leading-relaxed text-paper/85">
                {lede}
              </p>
            </div>
            <div className="relative mt-8 pt-6 border-t border-paper/20">
              {aside}
            </div>
          </div>

          <div className="v3-card p-8 md:p-10">{children}</div>
        </motion.div>
      </main>

      <footer className="py-6">
        <p className="text-center text-xs text-ink/45">
          <span>&copy; {new Date().getFullYear()} <V3AppLogo inline className="text-sm" /> &trade; · Modern build</span>
        </p>
      </footer>
    </div>
  );
};

export default V3AuthShell;
