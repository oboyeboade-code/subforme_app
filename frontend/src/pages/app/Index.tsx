import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Mail, Plus, Minus } from "lucide-react";
import ContactSection from "@/components/app/ContactSection";
import { AppLogo } from '@/components/app/SubformeLogo'
import { api } from "@/lib/page/api";

import type {
  LandingNavLink,
  LandingStep,
  Faq,
  ProviderCategoryCard,
} from "@/lib/page/api";

const Logo = () => (
  <Link to="/" className="flex items-center gap-3" aria-label="Subforme home">
    <AppLogo />
  </Link>
);

const Index = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [navLinks, setNavLinks] = useState<LandingNavLink[]>([]);
  const [steps, setSteps] = useState<LandingStep[]>([]);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [providerCategories, setProviderCategories] = useState<ProviderCategoryCard[]>([]);

  useEffect(() => {
    api.getLandingNav().then(setNavLinks);
    api.getLandingSteps().then(setSteps);
    api.getLandingFaqs().then(setFaqs);
    api.getLandingProviderCategories().then(setProviderCategories);
  }, []);

  return (
    <div className="min-h-screen bg-paper text-ink">

      <header className="border-b-2 border-ink">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-10">
          <Logo />
          <nav>
            <ul className="flex items-center gap-5 text-[13px] uppercase tracking-tight md:gap-8 md:text-sm">
              {navLinks.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="relative font-medium text-ink transition-colors hover:text-print-red"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="border-t border-ink/30">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-2 text-[11px] uppercase tracking-[0.2em] text-ink/70 md:px-10">
            <span>Vol. 01 · Issue 04</span>
            <span className="hidden md:inline">The Subforme Ledger</span>
            <span>April 2026 · Lagos Edition</span>
          </div>
        </div>
        <div className="border-t-2 border-ink" />
      </header>

      <main>

        <section className="relative border-b-2 border-ink">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-5 py-12 md:grid-cols-12 md:gap-8 md:px-10 md:py-20">

            <aside className="md:col-span-3">
              <div className="sticky top-6 space-y-4">
                <p className="font-mono-display text-[11px] uppercase tracking-[0.25em] text-print-red">
                  ▍ Cover Story
                </p>
                <p className="font-mono-display text-xs leading-relaxed text-ink/70">
                  Prepay your favorite vendors. Walk in, read a code, walk out. No transfer screens, no failed networks, no cash.
                </p>
                <div className="h-px w-16 bg-ink" />
                <p className="font-mono-display text-[11px] uppercase tracking-[0.2em] text-ink/60">
                  By the Subforme Desk
                </p>
              </div>
            </aside>

            <div className="md:col-span-9">
              <h1 className="font-editorial text-[clamp(3rem,9vw,7.5rem)] font-semibold leading-[0.92] tracking-tight">
                Pay
                <br />
                <span className="italic text-print-red">Without</span>
                <br />
                <span className="relative inline-block">
                  Struggle.
                  <span className="absolute -bottom-2 left-0 h-2 w-full bg-print-orange/80" aria-hidden />
                </span>
              </h1>

              <div className="mt-10 grid grid-cols-1 gap-6 border-t-2 border-ink pt-6 md:grid-cols-3">
                <p className="font-editorial text-lg leading-snug md:col-span-2 md:text-xl">
                  Subforme is the No. 1 place for your subs. Buy a bundle from a vendor you trust, get single-use codes by email, and redeem them at the counter in under ten seconds.
                </p>
                <div className="flex flex-col items-start gap-3">
                  <a
                    href="/login"
                    className="group inline-flex items-center gap-2 bg-print-green px-6 py-3 font-mono-display text-sm font-semibold uppercase tracking-wider text-paper transition-transform hover:-translate-y-0.5"
                  >
                    Login
                    <ArrowUpRight className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                  <a
                    href="#how"
                    className="font-mono-display text-xs uppercase tracking-[0.2em] text-ink/70 underline decoration-print-red decoration-2 underline-offset-4 hover:text-print-red"
                  >
                    How it works ↓
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t-2 border-ink bg-ink text-paper">
            <div className="mx-auto flex max-w-7xl items-center gap-8 overflow-hidden px-5 py-2 font-mono-display text-[11px] uppercase tracking-[0.2em] md:px-10">
              <span className="text-print-orange">● Live</span>
              <span>Foody · 12 codes redeemed today</span>
              <span className="text-ink-foreground/50">/</span>
              <span>Mama Tinu Kitchen · 47 bundles sold this week</span>
              <span className="hidden md:inline">/</span>
              <span className="hidden md:inline">Quick Wash · 3 new bundles available</span>
            </div>
          </div>
        </section>

        <section id="how" className="border-b-2 border-ink">
          <div className="mx-auto max-w-7xl px-5 py-16 md:px-10 md:py-24">
            <div className="mb-12 flex items-end justify-between border-b-2 border-ink pb-4">
              <div>
                <p className="font-mono-display text-[11px] uppercase tracking-[0.25em] text-print-red">
                  § Section II
                </p>
                <h2 className="font-editorial text-5xl font-semibold leading-none tracking-tight md:text-7xl">
                  How it works
                </h2>
              </div>
              <p className="hidden font-mono-display text-xs uppercase tracking-[0.2em] text-ink/60 md:block">
                Three steps · Under two minutes
              </p>
            </div>

            <ol className="grid grid-cols-1 gap-px bg-ink md:grid-cols-3">
              {steps.map((s) => (
                <li
                  key={s.no}
                  className="group relative flex flex-col bg-paper p-8 transition-colors hover:bg-paper-deep"
                >
                  <div className="flex items-baseline justify-between">
                    <span className={`font-editorial text-7xl font-semibold leading-none ${s.accent}`}>
                      {s.no}
                    </span>
                    <span className={`h-2 w-16 ${s.rule}`} aria-hidden />
                  </div>
                  <h3 className="mt-8 font-editorial text-3xl font-semibold leading-tight">
                    {s.title}
                  </h3>
                  <p className="mt-4 font-mono-display text-sm leading-relaxed text-ink/75">
                    {s.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="border-b-2 border-ink bg-paper-deep">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-5 py-16 md:grid-cols-12 md:px-10 md:py-24">
            <div className="md:col-span-5">
              <p className="font-mono-display text-[11px] uppercase tracking-[0.25em] text-print-red">
                ▍ Specimen
              </p>
              <h2 className="mt-2 font-editorial text-4xl font-semibold leading-tight md:text-6xl">
                One code.
                <br />
                <span className="italic text-print-green">One service.</span>
              </h2>
              <p className="mt-6 font-editorial text-lg leading-relaxed text-ink/80">
                Every code is single-use and locked to its provider. Zero double-spend. Zero cross-vendor redemption. Just a quiet, dependable handshake between you and the counter.
              </p>
              <div className="mt-6 flex items-center gap-3 font-mono-display text-xs uppercase tracking-[0.2em] text-ink/60">
                <Mail className="h-4 w-4" />
                Delivered to your inbox in under 2 minutes
              </div>
            </div>

            <div className="md:col-span-7">

              <div className="relative mx-auto max-w-md border-2 border-ink bg-paper p-6 shadow-[8px_8px_0_0_hsl(var(--ink))]">
                <div className="flex items-center justify-between border-b border-dashed border-ink/40 pb-3 font-mono-display text-[11px] uppercase tracking-[0.2em] text-ink/70">
                  <span>Subforme Receipt</span>
                  <span>#SF-0042766</span>
                </div>
                <div className="space-y-2 py-4 font-mono-display text-sm">
                  <div className="flex justify-between"><span>Vendor</span><span className="font-semibold">Foody Café</span></div>
                  <div className="flex justify-between"><span>Bundle</span><span className="font-semibold">10 × Lunch</span></div>
                  <div className="flex justify-between"><span>Issued</span><span className="font-semibold">Apr 24, 12:04</span></div>
                </div>
                <div className="border-t border-dashed border-ink/40 pt-4">
                  <p className="mb-3 font-mono-display text-[11px] uppercase tracking-[0.2em] text-ink/60">
                    Your codes
                  </p>
                  <div className="grid grid-cols-2 gap-2 font-mono-display text-sm">
                    {["FD-7K2A11", "FD-9M1QEE", "FD-3P8RAS", "FD-Z4VCMJ"].map((c, i) => (
                      <div
                        key={c}
                        className={`flex items-center justify-between border border-ink px-3 py-2 ${
                          i === 0 ? "bg-ink text-paper line-through" : "bg-paper"
                        }`}
                      >
                        <span>{c}</span>
                        <span className={`text-[10px] uppercase tracking-wider ${i === 0 ? "text-print-orange" : "text-print-green"}`}>
                          {i === 0 ? "Used" : "Unused"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-5 border-t-2 border-ink pt-3 text-center font-mono-display text-[11px] uppercase tracking-[0.25em] text-ink/60">
                  ✂ — Tear here at the counter — ✂
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="providers" className="border-b-2 border-ink bg-paper">
          <div className="mx-auto max-w-7xl px-5 py-16 md:px-10 md:py-24">
            <div className="mb-12 flex items-end justify-between border-b-2 border-ink pb-4">
              <div>
                <p className="font-mono-display text-[11px] uppercase tracking-[0.25em] text-print-red">
                  § Section IV
                </p>
                <h2 className="font-editorial text-5xl font-semibold leading-none tracking-tight md:text-7xl">
                  Who's on the desk
                </h2>
              </div>
              <p className="hidden font-mono-display text-xs uppercase tracking-[0.2em] text-ink/60 md:block">
                {providerCategories.reduce((n, c) => n + c.count, 0)} vendors · 6 categories
              </p>
            </div>

            <p className="font-editorial mb-10 max-w-2xl text-lg leading-relaxed text-ink/80 md:text-xl">
              A growing roster of invite-only vendors across the city. Browse the categories below — your favorites are likely already here.
            </p>

            <ul className="grid grid-cols-1 gap-px bg-ink sm:grid-cols-2 lg:grid-cols-3">
              {providerCategories.map((cat) => (
                <li
                  key={cat.name}
                  className="group flex flex-col bg-paper p-6 transition-colors hover:bg-paper-deep"
                >
                  <div className="flex items-baseline justify-between">
                    <span className={`h-2 w-12 ${cat.rule}`} aria-hidden />
                    <span className="font-mono-display text-[11px] uppercase tracking-[0.2em] text-ink/60">
                      {cat.count} vendors
                    </span>
                  </div>

                  <h3 className={`font-editorial mt-5 text-3xl font-semibold leading-tight ${cat.accent}`}>
                    {cat.name}
                  </h3>
                  <p className="font-mono-display mt-2 text-xs leading-relaxed text-ink/70">
                    {cat.tagline}
                  </p>

                  <div className="mt-5 border-t border-dashed border-ink/40 pt-4">
                    <p className="font-mono-display text-[10px] uppercase tracking-[0.25em] text-ink/50">
                      Featured
                    </p>
                    <ul className="mt-2 space-y-1 font-editorial text-base leading-snug">
                      {cat.featured.map((f) => (
                        <li key={f} className="flex items-baseline gap-2">
                          <span className={`font-mono-display text-[10px] ${cat.accent}`}>▍</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-auto pt-6">
                    <span className="inline-flex items-center gap-1 border-b border-ink pb-0.5 font-mono-display text-[11px] uppercase tracking-[0.2em] text-ink transition-colors group-hover:text-print-red group-hover:border-print-red">
                      Browse category
                      <ArrowUpRight className="h-3 w-3" />
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            <p className="font-mono-display mt-8 text-[11px] uppercase tracking-[0.25em] text-ink/60">
              Want to be on the desk? Subforme is invite-only —{" "}
              <a
                href="/vendor-login"
                className="text-print-red underline decoration-print-orange decoration-2 underline-offset-4"
              >
                talk to our team
              </a>
              .
            </p>
          </div>
        </section>

        {/* ── FAQs ─────────────────────────────────────────────── */}
        <section id="faqs" className="border-b-2 border-ink">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-5 py-16 md:grid-cols-12 md:px-10 md:py-24">
            <div className="md:col-span-4">
              <p className="font-mono-display text-[11px] uppercase tracking-[0.25em] text-print-red">
                § Section III
              </p>
              <h2 className="mt-2 font-editorial text-5xl font-semibold leading-none tracking-tight md:text-6xl">
                Asked &amp; answered.
              </h2>
              <p className="mt-6 font-mono-display text-sm leading-relaxed text-ink/70">
                Everything you should know before your first bundle. Still curious?
                <a href="#" className="ml-1 underline decoration-print-orange decoration-2 underline-offset-4 hover:text-print-red">
                  Talk to us.
                </a>
              </p>
            </div>

            <div className="md:col-span-8">
              <ul className="border-t-2 border-ink">
                {faqs.map((f, i) => {
                  const open = openFaq === i;
                  return (
                    <li key={f.q} className="border-b-2 border-ink">
                      <button
                        onClick={() => setOpenFaq(open ? null : i)}
                        className="flex w-full items-start justify-between gap-6 py-5 text-left transition-colors hover:bg-paper-deep"
                        aria-expanded={open}
                      >
                        <div className="flex items-baseline gap-4">
                          <span className="font-mono-display text-xs text-print-red">
                            0{i + 1}
                          </span>
                          <span className="font-editorial text-xl font-semibold leading-snug md:text-2xl">
                            {f.q}
                          </span>
                        </div>
                        <span className="mt-1 shrink-0 border border-ink p-1">
                          {open ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                        </span>
                      </button>
                      {open && (
                        <div className="pb-6 pl-10 pr-12">
                          <p className="font-editorial text-base leading-relaxed text-ink/80 md:text-lg">
                            {f.a}
                          </p>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </section>

        {/* ── CTA strip ────────────────────────────────────────── */}
        <section className="bg-ink text-paper">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-5 py-12 md:flex-row md:items-center md:px-10">
            <h3 className="font-editorial text-3xl leading-tight md:text-5xl">
              Stop fighting the network. <span className="italic text-print-orange">Start with a bundle.</span>
            </h3>
            <a
              href="/register"
              className="group inline-flex shrink-0 items-center gap-2 bg-print-orange px-6 py-3 font-mono-display text-sm font-semibold uppercase tracking-wider text-ink transition-transform hover:-translate-y-0.5"
            >
              Register
              <ArrowUpRight className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </section>

        <ContactSection />
      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t-2 border-ink bg-ink text-paper">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-5 py-6 font-mono-display text-[11px] uppercase tracking-[0.25em] md:px-10">
          <span>&copy; <AppLogo inline className="text-sm !normal-case" /> &trade; {new Date().getFullYear()}</span>
          <span>Pay Without Struggle</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
