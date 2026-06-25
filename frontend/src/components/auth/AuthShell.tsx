import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { AppLogo } from "../app/SubformeLogo";

interface AuthShellProps {
  edition: string;
  eyebrow: string;
  title: string;
  lede: string;
  accentClass?: string;
  ruleClass?: string;
  children: ReactNode;
  aside?: ReactNode;
}

const AuthShell = ({
  edition,
  eyebrow,
  title,
  lede,
  accentClass = "text-print-red",
  ruleClass = "bg-print-red",
  children,
  aside,
}: AuthShellProps) => {
  return (
    <div className="min-h-screen bg-paper text-ink">

      {/* HEADER */}
      <header className="border-b-2 border-ink">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-10">
          <Link to="/" className="flex items-center gap-3" aria-label="Subforme home">
            <AppLogo />
          </Link>
          <Link
            to="/"
            className="font-mono-display text-xs uppercase tracking-[0.2em] underline-offset-4 hover:underline"
          >
            ← Back to front page
          </Link>
        </div>
      </header>

      {/* STRIP */}
      <div className="border-b border-ink/30 bg-paper-deep">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-5 py-2 font-mono-display text-[11px] uppercase tracking-[0.25em] text-muted-foreground md:px-10">
          <span>{edition}</span>
          <span>Single-use codes · No struggle</span>
        </div>
      </div>

      {/* MAIN */}
      <main className="mx-auto grid max-w-7xl gap-10 px-5 py-10 md:grid-cols-5 md:gap-12 md:px-10 md:py-16">

        {/* LEFT */}
        <section className="md:col-span-2">
          <p className={`font-mono-display text-xs uppercase tracking-[0.3em] ${accentClass}`}>
            {eyebrow}
          </p>

          <div className={`mt-3 h-1 w-16 ${ruleClass}`} />

          <h1 className="font-editorial mt-6 text-5xl leading-[0.95] tracking-tight md:text-6xl">
            {title}
          </h1>

          <p className="mt-6 max-w-sm text-base leading-relaxed text-muted-foreground">
            {lede}
          </p>

          {aside && <div className="mt-10">{aside}</div>}
        </section>

        {/* RIGHT */}
        <section className="md:col-span-3">
          <div className="border-2 border-ink bg-card p-6 shadow-[6px_6px_0_0_hsl(var(--ink))] md:p-10">
            {children}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t-2 border-ink bg-ink text-paper">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-5 py-6 font-mono-display text-[11px] uppercase tracking-[0.25em] md:px-10">
          <span>&copy; <AppLogo inline className="text-sm !normal-case" /> &trade; {new Date().getFullYear()}</span>
          <span>Pay Without Struggle</span>
        </div>
      </footer>

    </div>
  );
};

export default AuthShell;