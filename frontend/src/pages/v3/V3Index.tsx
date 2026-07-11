import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Mail,
  ShieldCheck,
  Zap,
  Wallet,
  Coffee,
  Car,
  Scissors,
  ShoppingBag,
  Laptop,
  Dumbbell,
  Check,
} from "lucide-react";
import { api } from "@/lib/page/api";
import type { LandingNavLink, V3Step, V3VendorCard, Faq } from "@/lib/page/api";
import V3ContactSection from "@/components/v3/V3ContactSection";
import { V3AppLogo } from '../../components/v3/V3SubformeLogo';
import { handleGuestLogin } from "@/lib/auth/loginHandler";
import { useQueryClient } from "@tanstack/react-query";
import { useUIVersion } from "@/components/uiversion/UIVersionContext";
import GuestLoginFab from "@/components/GuestLoginFab";

const STEP_ICONS = { Wallet, Mail, Zap } as const;
const VENDOR_ICONS = {
  Coffee, Car, Scissors, ShoppingBag, Laptop, Dumbbell,
} as const;

const fade: any = {
  hidden: { opacity: 0, y: 18 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] } }),
};

const V3Index = () => {
  const [nav, setNav] = useState<LandingNavLink[]>([]);
  const [steps, setSteps] = useState<V3Step[]>([]);
  const [vendors, setVendors] = useState<V3VendorCard[]>([]);
  const [faqs, setFaqs] = useState<Faq[]>([]);  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const queryClient = useQueryClient();
  const { setVersion } = useUIVersion();

  const guestLogin = (role: 'admin' | 'vendor' | 'customer' | 'super-admin') => {
    handleGuestLogin({
      role,
      setLoading,
      navigate,
      queryClient,
      useV3: true,
      setVersion,
    })
  }

  useEffect(() => {
    api.getV3Nav().then(setNav);
    api.getV3Steps().then(setSteps);
    api.getV3Vendors().then(setVendors);
    api.getV3Faqs().then(setFaqs);
  }, []);

  return (
    <>
      <div className="font-v3 v3-bg text-ink min-h-screen">

        <header className="sticky top-0 z-30 backdrop-blur-md bg-paper/70 border-b border-ink/5">
          <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
            <Link to="/v3" className="flex items-center gap-2.5">
              <V3AppLogo />
            </Link>
            <nav className="hidden md:flex items-center gap-7 text-sm text-ink/70">
              {nav.map((n) => (
                <a key={n.label} href={n.href} className="hover:text-ink transition-colors">
                  {n.label}
                </a>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <Link to="/v3/login" className="hidden sm:inline-block text-sm font-medium text-ink/80 hover:text-ink px-3 py-2">
                Log in
              </Link>
              <Link to="/v3/register" className="v3-btn-primary text-sm inline-flex items-center gap-1.5">
                Get started <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </header>

        <main>

          <section className="relative overflow-hidden">
            <div className="max-w-6xl mx-auto px-5 md:px-8 pt-16 md:pt-28 pb-20 md:pb-28">
              <motion.h1
                variants={fade}
                initial="hidden"
                animate="show"
                custom={1}
                className="font-v3-display mt-6 text-center text-[clamp(2.5rem,7vw,5.5rem)] leading-[1.02] tracking-tight max-w-4xl mx-auto"
              >
                Prepay your favorites. <br className="hidden md:block" />
                <span className="v3-grad-text">Skip the struggle.</span>
              </motion.h1>

              <motion.p
                variants={fade}
                initial="hidden"
                animate="show"
                custom={2}
                className="mt-6 text-center text-lg md:text-xl text-ink/70 max-w-2xl mx-auto leading-relaxed"
              >
                Subforme bundles your daily spend with vendors you trust — coffee, lunch, washes — into single-use codes you redeem in under 10 seconds.
              </motion.p>

              <motion.div
                variants={fade}
                initial="hidden"
                animate="show"
                custom={3}
                className="mt-9 flex flex-wrap items-center justify-center gap-3"
              >
                <Link to="/v3/register" className="v3-btn-primary inline-flex items-center gap-2">
                  Create account <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="#how" className="v3-btn-ghost inline-flex items-center gap-2">
                  See how it works
                </a>
              </motion.div>

              <motion.div
                variants={fade}
                initial="hidden"
                animate="show"
                custom={4}
                className="mt-6 flex items-center justify-center gap-5 text-xs text-ink/55"
              >
                <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Single-use codes</span>
                <span className="h-1 w-1 rounded-full bg-ink/30" />
                <span className="inline-flex items-center gap-1.5"><Zap className="h-3.5 w-3.5" /> 2-min delivery</span>
                <span className="hidden sm:inline-flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-ink/30" />
                  <Wallet className="h-3.5 w-3.5" /> No double-spend
                </span>
              </motion.div>

              <motion.div
                variants={fade}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                custom={1}
                className="mt-16 md:mt-20 max-w-md mx-auto v3-card p-6"
              >
                <div className="flex items-center justify-between text-xs text-ink/55">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-print-green" /> Bundle active
                  </span>
                  <span>SF-0042700</span>
                </div>
                <div className="mt-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-ink/55">Vendor</p>
                    <p className="font-v3-display text-lg">Foody Café</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-ink/55">Bundle</p>
                    <p className="font-v3-display text-lg">10 × Lunch</p>
                  </div>
                </div>
                <div className="my-5 v3-divider" />
                <p className="text-xs text-ink/55 mb-3">Your codes</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { c: "FD-7K2ADD", used: true },
                    { c: "FD-9M1Q0O", used: false },
                    { c: "FD-3P8R3W", used: false },
                    { c: "FD-Z4VC11", used: false },
                  ].map((it) => (
                    <div
                      key={it.c}
                      className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                        it.used
                          ? "border-ink/15 bg-ink/[0.04] text-ink/40 line-through"
                          : "border-ink/15 bg-paper"
                      }`}
                    >
                      <span className="font-mono">{it.c}</span>
                      {it.used ? (
                        <span className="text-[10px] uppercase tracking-wider text-ink/40">Used</span>
                      ) : (
                        <Check className="h-3.5 w-3.5 text-print-green" />
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>

          <section id="how" className="py-20 md:py-28">
            <div className="max-w-6xl mx-auto px-5 md:px-8">
              <div className="text-center max-w-2xl mx-auto">
                <p className="text-sm font-medium text-print-red">How it works</p>
                <h2 className="font-v3-display mt-3 text-4xl md:text-5xl tracking-tight">
                  Three steps. Under two minutes.
                </h2>
                <p className="mt-4 text-ink/65 leading-relaxed">
                  Buy in the app, get codes by email, redeem at the counter. No transfers. No network anxiety.
                </p>
              </div>

              <div className="mt-14 grid md:grid-cols-3 gap-5">
                {steps.map((s, i) => (
                  <motion.div
                    key={s.title}
                    variants={fade}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.3 }}
                    custom={i}
                    className="v3-card p-7"
                  >
                    <div className="flex items-center justify-between">
                      <div className="h-11 w-11 rounded-xl flex items-center justify-center bg-gradient-to-br from-print-red/15 to-print-orange/15 text-print-red">
                        {(() => { const Icon = STEP_ICONS[s.iconName]; return <Icon className="h-5 w-5" />; })()}
                      </div>
                      <span className="text-xs text-ink/40">0{i + 1}</span>
                    </div>
                    <h3 className="mt-6 font-v3-display text-2xl">{s.title}</h3>
                    <p className="mt-2 text-ink/65 leading-relaxed text-[15px]">{s.body}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          <section id="vendors" className="py-20 md:py-28 bg-paper/50">
            <div className="max-w-6xl mx-auto px-5 md:px-8">
              <div className="flex items-end justify-between gap-6 flex-wrap">
                <div className="max-w-xl">
                  <p className="text-sm font-medium text-print-red">Who's on Subforme</p>
                  <h2 className="font-v3-display mt-3 text-4xl md:text-5xl tracking-tight">
                    Your everyday vendors, prepaid.
                  </h2>
                </div>
                <p className="text-sm text-ink/55">
                  {vendors.reduce((n, v) => n + v.count, 0)} vendors · 6 categories
                </p>
              </div>

              <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {vendors.map((v, i) => (
                  <motion.a
                    key={v.name}
                    href="/v3/register"
                    variants={fade}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.2 }}
                    custom={i}
                    className="v3-card p-6 group block"
                  >
                    <div className={`h-32 rounded-xl bg-gradient-to-br ${v.hue} flex items-center justify-center`}>
                      {(() => { const Icon = VENDOR_ICONS[v.iconName]; return <Icon className="h-9 w-9 text-ink/70" />; })()}
                    </div>
                    <div className="mt-5 flex items-center justify-between">
                      <h3 className="font-v3-display text-xl">{v.name}</h3>
                      <span className="text-xs text-ink/50">{v.count} vendors</span>
                    </div>
                    <div className="mt-4 inline-flex items-center gap-1.5 text-sm text-ink/70 group-hover:text-print-red transition-colors">
                      Browse <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>
          </section>

          {/* ── Trust strip ──────────────────────────────────── */}
          <section className="py-20 md:py-24">
            <div className="max-w-5xl mx-auto px-5 md:px-8">
              <div className="v3-card p-8 md:p-12 grid md:grid-cols-3 gap-8 md:gap-4">
                {[
                  { k: "< 2 min", v: "Codes delivered after purchase" },
                  { k: "< 10 sec", v: "Average counter redemption" },
                  { k: "0", v: "Double-spends since launch" },
                ].map((stat) => (
                  <div key={stat.k} className="text-center md:border-r md:last:border-r-0 md:border-ink/15">
                    <p className="font-v3-display text-5xl v3-grad-text">{stat.k}</p>
                    <p className="mt-2 text-sm text-ink/60">{stat.v}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── FAQ ──────────────────────────────────────────── */}
          <section id="faq" className="py-20 md:py-28">
            <div className="max-w-3xl mx-auto px-5 md:px-8">
              <div className="text-center">
                <p className="text-sm font-medium text-print-red">Questions</p>
                <h2 className="font-v3-display mt-3 text-4xl md:text-5xl tracking-tight">
                  Good to know.
                </h2>
              </div>
              <div className="mt-12 space-y-3">
                {faqs.map((f) => (
                  <details key={f.q} className="v3-card p-5 group" >
                    <summary className="cursor-pointer flex items-center justify-between font-medium text-ink list-none">
                      {f.q}
                      <span className="ml-4 h-6 w-6 rounded-full border border-ink/15 flex items-center justify-center text-ink/60 group-open:rotate-45 transition-transform">+</span>
                    </summary>
                    <p className="mt-3 text-ink/65 leading-relaxed text-[15px]">{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* ── Contact ──────────────────────────────────────── */}
          <V3ContactSection />

          {/* ── CTA ──────────────────────────────────────────── */}
          <section className="pb-24">
            <div className="max-w-5xl mx-auto px-5 md:px-8">
              <div className="relative overflow-hidden rounded-[28px] p-10 md:p-16 text-center"
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--print-red)), hsl(var(--print-orange)))",
                  }}>
                <div className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: "radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 60%, white 1px, transparent 1px)",
                      backgroundSize: "40px 40px, 32px 32px",
                    }} />
                <div className="relative">
                  <h2 className="font-v3-display text-4xl md:text-5xl text-paper tracking-tight">
                    Stop transferring. Start redeeming.
                  </h2>
                  <p className="mt-4 text-paper/85 max-w-xl mx-auto">
                    Open a Subforme account in under a minute. Your first bundle is just an email away.
                  </p>
                  <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                    <Link
                      to="/v3/register"
                      className="inline-flex items-center gap-2 rounded-full bg-paper text-ink px-6 py-3 font-semibold hover:bg-paper/90 transition-colors"
                    >
                      Create account <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      to="/v3/login"
                      className="inline-flex items-center gap-2 rounded-full border border-paper/40 text-paper px-6 py-3 font-medium hover:bg-paper/10 transition-colors"
                    >
                      I already have one
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* ── Footer ─────────────────────────────────────────── */}
        <footer className="border-t border-ink/12 py-10">
          <div className="max-w-6xl mx-auto px-5 md:px-8 flex flex-wrap items-center justify-between gap-4 text-sm text-ink/55">
            <div className="flex items-center gap-2">
              <span>&copy; <V3AppLogo inline className="text-sm" /> &trade; {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-5">
              <a href="#" className="hover:text-ink">Privacy</a>
              <a href="#" className="hover:text-ink">Terms</a>
              <Link to="/v3/vendor-login" className="hover:text-ink">For vendors</Link>
            </div>
          </div>
        </footer>
      </div>
      <GuestLoginFab
        disabled={loading}
        onAdmin={() => guestLogin('admin')}
        onVendor={() => guestLogin('vendor')}
        onCustomer={() => guestLogin('customer')}
        onSuperAdmin={() => guestLogin('super-admin')}
      />
    </>
  );
};

export default V3Index;
