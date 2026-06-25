import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { userApi, type Profile } from "@/lib/api/user.api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  User as UserIcon,
  Mail,
  Phone,
  Globe2,
  CreditCard,
  Gift,
  Copy,
  Check,
  Sparkles,
  BadgeCheck,
  Calendar,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Mock surface — same pattern as the dashboards. Replace with real fields   */
/*  once the backend exposes them on userApi.getProfile().                    */
/* -------------------------------------------------------------------------- */
const MOCK = {
  coins: 2840,
  totalSpend: 18750,
  activeSubs: 4,
  streakDays: 12,
  emailVerified: true,
  memberSince: "2024-03-14",
  referralCode: "SPIDER-9F2A",
  preferredPaymentChannel: "card" as "card" | "bank" | "wallet" | "crypto",
  timezone: "Africa/Lagos",
  phone: "+234 801 234 5678",
};

const TIMEZONES = [
  "Africa/Lagos",
  "Africa/Accra",
  "Africa/Nairobi",
  "Africa/Johannesburg",
  "Europe/London",
  "Europe/Berlin",
  "America/New_York",
  "America/Los_Angeles",
  "Asia/Dubai",
  "Asia/Singapore",
];

const CHANNELS: Array<{ id: NonNullable<typeof MOCK.preferredPaymentChannel>; label: string }> = [
  { id: "card", label: "Card" },
  { id: "bank", label: "Bank" },
  { id: "wallet", label: "Wallet" },
  { id: "crypto", label: "Crypto" },
];

/* ---------------------- shared level calc (mirrors dashboard) -------------- */
const calcLevel = (spend: number, subs: number, streak: number) => {
  const xp = Math.floor(spend / 1000) + subs * 25 + streak * 10;
  const level = Math.max(1, Math.floor(Math.sqrt(xp / 10)));
  const nextLevelXp = Math.pow(level + 1, 2) * 10;
  const prevLevelXp = Math.pow(level, 2) * 10;
  const progress = Math.min(100, ((xp - prevLevelXp) / (nextLevelXp - prevLevelXp)) * 100);
  const titles = ["Newcomer", "Explorer", "Regular", "Enthusiast", "Veteran", "Champion", "Legend"];
  const title = titles[Math.min(level - 1, titles.length - 1)] ?? "Legend";
  return { xp, level, progress, title };
};

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export const ProfileModal = ({ open, onOpenChange }: Props) => {
  const [version, setVersion] = useState<Profile["uiVersion"]>("editorial");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    (async () => {
      try {
        const res = await userApi.getProfile();
        if (alive) setVersion(res.data.uiVersion ?? "editorial");
      } catch {
        /* fall back to editorial */
      } finally {
        if (alive) setHydrated(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [open]);

  if (!hydrated && open) return null;
  return version === "v3" ? (
    <V3Profile open={open} onOpenChange={onOpenChange} />
  ) : (
    <EditorialProfile open={open} onOpenChange={onOpenChange} />
  );
};

/* -------------------------------------------------------------------------- */
/*  Shared form state hook                                                    */
/* -------------------------------------------------------------------------- */
function useProfileForm(open: boolean) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(MOCK.phone);
  const [timezone, setTimezone] = useState(MOCK.timezone);
  const [channel, setChannel] =
    useState<typeof MOCK.preferredPaymentChannel>(MOCK.preferredPaymentChannel);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        setLoading(true);
        const response = await userApi.getProfile();
        const p: any = response.data;
        setName(p.name ?? "");
        setEmail(p.email ?? "");
        setPhone(p.phone ?? MOCK.phone);
        setTimezone(p.timezone ?? MOCK.timezone);
        setChannel(p.preferredPaymentChannel ?? MOCK.preferredPaymentChannel);
      } catch {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, [open]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    try {
      setSaving(true);
      await userApi.updateProfile({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        timezone,
        // @ts-expect-error preferredPaymentChannel will land on backend
        preferredPaymentChannel: channel,
      });
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const copyReferral = async () => {
    try {
      await navigator.clipboard.writeText(MOCK.referralCode);
      setCopied(true);
      toast.success("Referral code copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy");
    }
  };

  const level = calcLevel(MOCK.totalSpend, MOCK.activeSubs, MOCK.streakDays);
  const memberSince = new Date(MOCK.memberSince).toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });

  return {
    name, setName, email, setEmail, phone, setPhone, timezone, setTimezone,
    channel, setChannel, loading, saving, copied, save, copyReferral,
    level, memberSince,
  };
}

/* ============================== V3 VARIANT ================================ */

const V3Profile = ({ open, onOpenChange }: Props) => {
  const f = useProfileForm(open);
  const initials = (f.name || "U").split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-paper rounded-[20px] border border-ink/10 shadow-2xl w-[calc(100%-1.5rem)] sm:w-full max-w-lg p-0 overflow-hidden max-h-[calc(100dvh-2rem)] flex flex-col">
        {/* Hero */}
        <div className="p-5 sm:p-6 border-b border-ink/8 bg-gradient-to-br from-paper to-paper-deep/40 shrink-0">
          <DialogHeader>
            <div className="flex items-center gap-3 min-w-0">
              <span className="h-12 w-12 shrink-0 rounded-2xl bg-gradient-to-br from-print-orange to-print-red flex items-center justify-center text-paper font-v3-display font-semibold shadow-[0_10px_24px_-10px_hsl(var(--print-red)/0.55)]">
                {initials}
              </span>
              <div className="min-w-0 flex-1">
                <DialogTitle className="font-v3-display text-xl sm:text-2xl text-ink truncate">
                  Edit Profile
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1 text-xs text-ink/55">
                  <Sparkles className="h-3 w-3 text-print-red" />
                  <span>Lv. {f.level.level} · {f.level.title}</span>
                </div>
              </div>
            </div>
            {/* XP bar */}
            {/* <div className="mt-4">
              <div className="h-1.5 w-full bg-ink/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-print-orange to-print-red transition-all"
                  style={{ width: `${f.level.progress}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-ink/45 mt-1">
                <span>{f.level.xp} XP</span>
                <span>Lv. {f.level.level + 1}</span>
              </div>
            </div> */}
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
          {f.loading ? (
            <div className="py-8 text-center text-sm text-ink/55">Loading…</div>
          ) : (
            <form onSubmit={f.save} className="space-y-6" id="v3-profile-form">
              {/* Identity */}
              <V3Section icon={<UserIcon className="h-3.5 w-3.5" />} label="Identity">
                <V3Field label="Full name" icon={<UserIcon className="h-3.5 w-3.5" />}>
                  <input value={f.name} onChange={(e) => f.setName(e.target.value)} className={v3Input} />
                </V3Field>
                <V3Field label="Email" icon={<Mail className="h-3.5 w-3.5" />}>
                  <div className="flex items-center gap-2">
                    <input type="email" value={f.email} onChange={(e) => f.setEmail(e.target.value)} className={v3Input} />
                    {MOCK.emailVerified && (
                      <span className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-print-red/10 text-print-red text-[10px] font-semibold">
                        <BadgeCheck className="h-3 w-3" /> Verified
                      </span>
                    )}
                  </div>
                </V3Field>
                <V3Field label="Phone" icon={<Phone className="h-3.5 w-3.5" />}>
                  <input value={f.phone} onChange={(e) => f.setPhone(e.target.value)} className={v3Input} />
                </V3Field>
                <V3Field label="Timezone" icon={<Globe2 className="h-3.5 w-3.5" />}>
                  <select value={f.timezone} onChange={(e) => f.setTimezone(e.target.value)} className={v3Input}>
                    {TIMEZONES.map((tz) => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </V3Field>
              </V3Section>

              {/* Wallet */}
              {/* <V3Section icon={<CreditCard className="h-3.5 w-3.5" />} label="Wallet">
                <V3Field label="Preferred payment channel">
                  <div className="grid grid-cols-4 gap-2">
                    {CHANNELS.map((c) => (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => f.setChannel(c.id)}
                        className={cn(
                          "px-2 py-2 rounded-xl text-[11px] font-semibold transition-all",
                          f.channel === c.id
                            ? "bg-gradient-to-br from-print-orange to-print-red text-paper shadow-[0_8px_20px_-10px_hsl(var(--print-red)/0.55)]"
                            : "bg-ink/[0.04] text-ink/70 hover:bg-ink/[0.08]"
                        )}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </V3Field>
                <div className="flex items-center justify-between bg-ink/[0.03] px-4 py-3 rounded-xl">
                  <span className="text-xs text-ink/55">Coin balance</span>
                  <span className="font-v3-display text-lg text-ink">{MOCK.coins.toLocaleString()}</span>
                </div>
              </V3Section> */}

              {/* Referral */}
              {/* <V3Section icon={<Gift className="h-3.5 w-3.5" />} label="Referral">
                <button
                  type="button"
                  onClick={f.copyReferral}
                  className="w-full flex items-center justify-between bg-gradient-to-br from-print-red/5 to-print-orange/5 border border-print-red/20 px-4 py-3 rounded-xl hover:from-print-red/10 hover:to-print-orange/10 transition-colors"
                >
                  <div className="text-left">
                    <div className="text-[10px] uppercase tracking-wider text-ink/55">Your code</div>
                    <div className="font-mono text-sm font-semibold text-ink">{MOCK.referralCode}</div>
                  </div>
                  {f.copied ? <Check className="h-4 w-4 text-print-red" /> : <Copy className="h-4 w-4 text-ink/55" />}
                </button>
              </V3Section> */}

              {/* Account */}
              <V3Section icon={<Calendar className="h-3.5 w-3.5" />} label="Account">
                <div className="flex items-center justify-between bg-ink/[0.03] px-4 py-3 rounded-xl">
                  <span className="text-xs text-ink/55">Member since</span>
                  <span className="text-sm text-ink">{f.memberSince}</span>
                </div>
              </V3Section>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-ink/8 bg-paper-deep/30 shrink-0 flex gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={f.saving}
            className="flex-1 text-xs font-semibold bg-ink/[0.04] text-ink/70 py-3 rounded-xl hover:bg-ink/[0.08] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="v3-profile-form"
            disabled={f.saving}
            className="flex-1 text-xs font-semibold bg-gradient-to-br from-print-orange to-print-red text-paper py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 shadow-[0_10px_24px_-12px_hsl(var(--print-red)/0.55)]"
          >
            {f.saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const v3Input =
  "w-full bg-ink/[0.04] border border-transparent focus:border-print-red/40 focus:bg-paper px-3 py-2 rounded-xl text-sm text-ink outline-none transition-colors";

const V3Section = ({
  icon, label, children,
}: { icon?: React.ReactNode; label: string; children: React.ReactNode }) => (
  <section className="space-y-3">
    <h3 className="text-[11px] uppercase tracking-wider text-ink/50 flex items-center gap-2 font-semibold">
      {icon} {label}
    </h3>
    <div className="space-y-2.5">{children}</div>
  </section>
);

const V3Field = ({
  label, icon, children,
}: { label: string; icon?: React.ReactNode; children: React.ReactNode }) => (
  <label className="block">
    <span className="text-[10px] uppercase tracking-wider text-ink/50 mb-1.5 flex items-center gap-1.5">
      {icon} {label}
    </span>
    {children}
  </label>
);

/* ========================== EDITORIAL VARIANT ============================= */

const EditorialProfile = ({ open, onOpenChange }: Props) => {
  const f = useProfileForm(open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-paper border-2 border-ink rounded-none w-[calc(100%-1.5rem)] sm:w-full max-w-xl p-0 gap-0 max-h-[calc(100dvh-2rem)] overflow-hidden flex flex-col [&>button]:text-ink [&>button]:opacity-100 [&>button]:top-3 sm:[&>button]:top-5 [&>button]:right-3 sm:[&>button]:right-5 [&>button]:hover:bg-ink [&>button]:hover:text-paper [&>button]:border-2 [&>button]:border-ink [&>button]:p-1">
        {/* Masthead */}
        <div className="border-b-2 border-ink p-4 sm:p-5 bg-paper-deep/40 shrink-0">
          <DialogHeader className="space-y-0">
            <div className="flex items-baseline justify-between gap-3 min-w-0">
              <DialogTitle className="font-editorial text-2xl sm:text-4xl tracking-[-0.02em] leading-none text-ink truncate">
                PROFILE
              </DialogTitle>
              <span className="font-mono-display text-[9px] uppercase tracking-[0.3em] text-ink/60 shrink-0">
                Sec. P
              </span>
            </div>
            {/* <div className="font-mono-display text-[9px] uppercase tracking-[0.3em] text-ink/60 mt-2 border-t border-ink/30 pt-2 flex items-center justify-between">
              <span>Identity Desk · {new Date().getFullYear()}</span>
              <span>
                Lv. {f.level.level} · <em className="font-editorial italic not-italic-fallback">{f.level.title}</em>
              </span>
            </div> */}
            {/* XP ruler */}
            {/* <div className="mt-3 border-t border-ink/30 pt-3">
              <div className="h-2 w-full border-2 border-ink overflow-hidden bg-paper">
                <div className="h-full bg-ink transition-all" style={{ width: `${f.level.progress}%` }} />
              </div>
              <div className="flex justify-between font-mono-display text-[9px] uppercase tracking-[0.25em] text-ink/60 mt-1">
                <span>{f.level.xp} XP</span>
                <span>Next · Lv. {f.level.level + 1}</span>
              </div>
            </div> */}
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 space-y-6 overflow-y-auto flex-1">
          {f.loading ? (
            <div className="py-8 text-center font-mono-display text-sm text-muted-foreground">
              Loading profile…
            </div>
          ) : (
            <form onSubmit={f.save} className="space-y-6" id="ed-profile-form">
              <EdSection label="§ Identity">
                <EdField label="Full name">
                  <input value={f.name} onChange={(e) => f.setName(e.target.value)} className={edInput} />
                </EdField>
                <EdField label="Email">
                  <div className="flex items-center gap-2">
                    <input type="email" value={f.email} onChange={(e) => f.setEmail(e.target.value)} className={edInput} />
                    {MOCK.emailVerified && (
                      <span className="shrink-0 border-2 border-ink px-2 py-1 font-mono-display text-[9px] uppercase tracking-[0.25em] bg-ink text-paper">
                        Verified
                      </span>
                    )}
                  </div>
                </EdField>
                <EdField label="Phone">
                  <input value={f.phone} onChange={(e) => f.setPhone(e.target.value)} className={edInput} />
                </EdField>
                <EdField label="Timezone">
                  <select value={f.timezone} onChange={(e) => f.setTimezone(e.target.value)} className={edInput}>
                    {TIMEZONES.map((tz) => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </EdField>
              </EdSection>

              {/* <EdSection label="§ Wallet">
                <EdField label="Preferred payment channel">
                  <div className="grid grid-cols-4 gap-0 border-2 border-ink">
                    {CHANNELS.map((c, i) => (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => f.setChannel(c.id)}
                        className={cn(
                          "py-2 font-mono-display text-[10px] uppercase tracking-[0.2em] transition-colors",
                          i > 0 && "border-l-2 border-ink",
                          f.channel === c.id ? "bg-ink text-paper" : "bg-paper text-ink hover:bg-ink/[0.05]"
                        )}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </EdField>
                <div className="flex items-center justify-between border-b border-ink/20 py-2">
                  <span className="font-mono-display text-xs uppercase tracking-[0.2em] text-ink/80">Coin Balance</span>
                  <span className="font-editorial text-xl text-ink">{MOCK.coins.toLocaleString()}</span>
                </div>
              </EdSection> */}

              {/* <EdSection label="§ Referral Code">
                <button
                  type="button"
                  onClick={f.copyReferral}
                  className="w-full flex items-center justify-between border-2 border-ink px-4 py-3 hover:bg-ink hover:text-paper transition-colors group"
                >
                  <div className="text-left">
                    <div className="font-mono-display text-[9px] uppercase tracking-[0.3em] text-ink/60 group-hover:text-paper/60">
                      Share &amp; earn
                    </div>
                    <div className="font-mono-display text-base font-semibold tracking-wider">{MOCK.referralCode}</div>
                  </div>
                  {f.copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </EdSection> */}

              {/* <EdSection label="§ Account">
                <div className="grid grid-cols-2 gap-0 border-2 border-ink">
                  <div className="p-3 border-r-2 border-ink">
                    <div className="font-mono-display text-[9px] uppercase tracking-[0.3em] text-ink/60">Member since</div>
                    <div className="font-editorial text-lg text-ink mt-1">{f.memberSince}</div>
                  </div>
                  <div className="p-3">
                    <div className="font-mono-display text-[9px] uppercase tracking-[0.3em] text-ink/60">Streak</div>
                    <div className="font-editorial text-lg text-ink mt-1">{MOCK.streakDays} days</div>
                  </div>
                </div>
              </EdSection> */}
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="border-t-2 border-ink p-4 shrink-0 flex gap-2 bg-paper-deep/30">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={f.saving}
            className="flex-1 border-2 border-ink py-2 font-mono-display text-xs uppercase tracking-wider hover:bg-paper-deep disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="ed-profile-form"
            disabled={f.saving}
            className="flex-1 border-2 border-ink bg-print-red text-primary-foreground py-2 font-mono-display text-xs uppercase tracking-wider hover:opacity-90 disabled:opacity-50"
          >
            {f.saving ? "Saving…" : "Save"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const edInput =
  "w-full border-2 border-ink bg-paper-deep px-3 py-2 font-mono-display text-sm outline-none focus:bg-paper";

const EdSection = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <section className="space-y-3">
    <h3 className="font-mono-display text-[9px] uppercase tracking-[0.3em] text-ink">{label}</h3>
    <div className="border-t-2 border-ink pt-3 space-y-3">{children}</div>
  </section>
);

const EdField = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="font-mono-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1 block">
      {label}
    </span>
    {children}
  </label>
);
