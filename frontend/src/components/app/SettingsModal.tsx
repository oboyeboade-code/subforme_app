import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Settings as SettingsIcon,
  Bell,
  RefreshCcw,
  Palette,
  LogOut,
  Crown,
  Gamepad2,
  Wallet,
  Shield,
  AlertTriangle,
  KeyRound,
  Volume2,
  Sparkles,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { userApi, type Profile } from "@/lib/api/user.api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { handleLogout } from "@/lib/auth/logoutHandler";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

type UIVersion = Profile["uiVersion"]; // "v3" | "editorial"

const PROFILE_KEY = ["profile"] as const;

/* -------------------------------------------------------------------------- */
/*  MOCK — same pattern as dashboards. Replace with real fields when ready.   */
/* -------------------------------------------------------------------------- */
const MOCK = {
  subscriptionPlan: "premium" as "basic" | "premium",
  subscriptionDaysLeft: 18,
  subscriptionTotalDays: 30,
  spiderHuntBest: 4280,
  notifPrefs: {
    subscriptionExpiry: true,
    vendorUpdates: true,
    spiderLeaderboard: false,
    referralPayouts: true,
  },
  gamePrefs: {
    sound: true,
    difficulty: "normal" as "easy" | "normal" | "hard",
  },
};

function mapPath(pathname: string, target: UIVersion): string {
  const stripped = pathname.replace(/^\/v3(?=\/|$)/, "") || "/";
  return target === "v3"
    ? stripped === "/" ? "/v3" : `/v3${stripped}`
    : stripped;
}

function useProfileQuery() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: PROFILE_KEY,
    queryFn: async () => {
      const res = await userApi.getProfile();
      return res.data as Profile;
    },
    staleTime: 60_000,
  });
  const mutation = useMutation({
    mutationFn: async (patch: Partial<Profile>) => {
      const res = await userApi.updateProfile(patch);
      return res.data as Profile;
    },
    onMutate: async (patch) => {
      await qc.cancelQueries({ queryKey: PROFILE_KEY });
      const previous = qc.getQueryData<Profile>(PROFILE_KEY);
      if (previous) qc.setQueryData<Profile>(PROFILE_KEY, { ...previous, ...patch });
      return { previous };
    },
    onError: (_e, _p, ctx) => {
      if (ctx?.previous) qc.setQueryData(PROFILE_KEY, ctx.previous);
      toast.error("Couldn't save changes");
    },
    onSuccess: (fresh) => qc.setQueryData(PROFILE_KEY, fresh),
  });
  return {
    profile: query.data,
    isLoading: query.isLoading,
    updateProfile: (patch: Partial<Profile>) => mutation.mutate(patch),
  };
}

/* ---------------------- local-only mock prefs hook ------------------------ */
function useLocalPrefs() {
  const [notif, setNotif] = useState(MOCK.notifPrefs);
  const [game, setGame] = useState(MOCK.gamePrefs);
  return { notif, setNotif, game, setGame };
}

export const SettingsModal = ({ open, onOpenChange }: Props) => {
  const { profile } = useProfileQuery();
  const version: UIVersion = profile?.uiVersion ?? "editorial";
  return version === "v3" ? (
    <V3Settings open={open} onOpenChange={onOpenChange} />
  ) : (
    <EditorialSettings open={open} onOpenChange={onOpenChange} />
  );
};

/* ================================= V3 ===================================== */

const V3Settings = ({ open, onOpenChange }: Props) => {
  const { profile, updateProfile } = useProfileQuery();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  // const [resetBest, setResetBest] = useState(false);
  const prefs = useLocalPrefs();
  const version: UIVersion = profile?.uiVersion ?? "v3";

  const handleLogOut = () => {
    if (isLoggingOut) return;
    handleLogout(setIsLoggingOut, navigate, true);
  };

  const handleVersionSwitch = (newVersion: UIVersion) => {
    if (newVersion === version) return;
    updateProfile({ uiVersion: newVersion });
    onOpenChange(false);
    navigate(mapPath(location.pathname, newVersion));
    toast.success(`Switched to ${newVersion === "v3" ? "Modern" : "Editorial"} interface`);
  };

  const subPct = (MOCK.subscriptionDaysLeft / MOCK.subscriptionTotalDays) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-paper rounded-[20px] border border-ink/10 shadow-2xl w-[calc(100%-1.5rem)] sm:w-full max-w-md p-0 overflow-hidden max-h-[calc(100dvh-2rem)] flex flex-col">
        <div className="p-5 sm:p-6 border-b border-ink/8 bg-gradient-to-br from-paper to-paper-deep/40 shrink-0">
          <DialogHeader>
            <div className="flex items-center gap-3 min-w-0">
              <span className="h-11 w-11 shrink-0 rounded-2xl bg-gradient-to-br from-print-orange to-print-red flex items-center justify-center text-paper shadow-[0_10px_24px_-10px_hsl(var(--print-red)/0.55)]">
                <SettingsIcon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <DialogTitle className="font-v3-display text-xl sm:text-2xl text-ink truncate">Settings</DialogTitle>
                <p className="text-xs text-ink/55 mt-0.5 truncate">Configure your experience</p>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
          {/* Subscription */}
          <Section icon={<Crown className="h-3.5 w-3.5" />} label="Subscription">
            <div className="bg-gradient-to-br from-print-red/5 to-print-orange/5 border border-print-red/20 px-4 py-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-ink/55">Current plan</div>
                  <div className="font-v3-display text-lg text-ink capitalize mt-0.5 flex items-center gap-2">
                    {MOCK.subscriptionPlan}
                    {MOCK.subscriptionPlan === "premium" && <Sparkles className="h-3.5 w-3.5 text-print-red" />}
                  </div>
                </div>
                {MOCK.subscriptionPlan === "basic" && (
                  <button className="text-[11px] font-semibold bg-gradient-to-br from-print-orange to-print-red text-paper px-3 py-1.5 rounded-lg shadow-[0_8px_20px_-10px_hsl(var(--print-red)/0.55)]">
                    Upgrade
                  </button>
                )}
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-ink/55 mb-1">
                  <span>{MOCK.subscriptionDaysLeft} days left</span>
                  <span>{MOCK.subscriptionTotalDays}d cycle</span>
                </div>
                <div className="h-1.5 w-full bg-ink/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-print-orange to-print-red" style={{ width: `${subPct}%` }} />
                </div>
              </div>
            </div>
          </Section>

          {/* Notifications */}
          <Section icon={<Bell className="h-3.5 w-3.5" />} label="Notifications">
            {/* <V3Row label="Master switch">
              <V3Toggle on={!!profile?.notificationsEnabled} disabled={!profile}
                onChange={(v) => updateProfile({ notificationsEnabled: v } as Partial<Profile>)} />
            </V3Row> */}
            <V3Row label="Email receipts">
              <V3Toggle on={!!profile?.emailReceipts} disabled={!profile}
                onChange={(v) => updateProfile({ emailReceipts: v } as Partial<Profile>)} />
            </V3Row>
            <V3Row label="Subscription expiry">
              <V3Toggle on={prefs.notif.subscriptionExpiry}
                onChange={(v) => prefs.setNotif({ ...prefs.notif, subscriptionExpiry: v })} />
            </V3Row>
            {/* <V3Row label="Vendor updates">
              <V3Toggle on={prefs.notif.vendorUpdates}
                onChange={(v) => prefs.setNotif({ ...prefs.notif, vendorUpdates: v })} />
            </V3Row>
            <V3Row label="Spider Hunt leaderboard">
              <V3Toggle on={prefs.notif.spiderLeaderboard}
                onChange={(v) => prefs.setNotif({ ...prefs.notif, spiderLeaderboard: v })} />
            </V3Row>
            <V3Row label="Referral payouts">
              <V3Toggle on={prefs.notif.referralPayouts}
                onChange={(v) => prefs.setNotif({ ...prefs.notif, referralPayouts: v })} />
            </V3Row> */}
          </Section>

          {/* Game */}
          {/* <Section icon={<Gamepad2 className="h-3.5 w-3.5" />} label="Spider Hunt">
            <V3Row label="Sound effects">
              <V3Toggle on={prefs.game.sound} onChange={(v) => prefs.setGame({ ...prefs.game, sound: v })} />
            </V3Row>
            <div className="bg-ink/[0.03] px-4 py-3 rounded-xl">
              <div className="text-xs text-ink/55 mb-2">Default difficulty</div>
              <div className="grid grid-cols-3 gap-2">
                {(["easy", "normal", "hard"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => prefs.setGame({ ...prefs.game, difficulty: d })}
                    className={cn(
                      "py-2 rounded-lg text-[11px] font-semibold capitalize transition-all",
                      prefs.game.difficulty === d
                        ? "bg-gradient-to-br from-print-orange to-print-red text-paper shadow-[0_8px_20px_-10px_hsl(var(--print-red)/0.55)]"
                        : "bg-ink/[0.04] text-ink/70 hover:bg-ink/[0.08]"
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between bg-ink/[0.03] px-4 py-3 rounded-xl">
              <div>
                <div className="text-xs text-ink/55">Best score</div>
                <div className="font-v3-display text-lg text-ink">{MOCK.spiderHuntBest.toLocaleString()}</div>
              </div>
              {resetBest ? (
                <div className="flex gap-1.5">
                  <button onClick={() => { toast.success("Best score reset"); setResetBest(false); }}
                    className="text-[11px] font-semibold bg-print-red text-paper px-3 py-1.5 rounded-lg">Confirm</button>
                  <button onClick={() => setResetBest(false)}
                    className="text-[11px] font-semibold bg-ink/[0.06] text-ink/70 px-3 py-1.5 rounded-lg">Cancel</button>
                </div>
              ) : (
                <button onClick={() => setResetBest(true)}
                  className="text-[11px] font-semibold bg-print-red/10 text-print-red px-3 py-1.5 rounded-lg hover:bg-print-red/15">
                  Reset
                </button>
              )}
            </div>
          </Section> */}

          {/* Interface */}
          <Section icon={<RefreshCcw className="h-3.5 w-3.5" />} label="Interface Style">
            <div className="grid grid-cols-2 gap-3">
              <SkinPreviewButton skin="modern" active={version === "v3"} onClick={() => handleVersionSwitch("v3")} />
              <SkinPreviewButton skin="editorial" active={version === "editorial"} onClick={() => handleVersionSwitch("editorial")} />
            </div>
          </Section>

          <Section icon={<Palette className="h-3.5 w-3.5" />} label="Appearance">
            <ThemeToggle variant="v3" />
          </Section>

          {/* Security */}
          <Section icon={<Shield className="h-3.5 w-3.5" />} label="Security">
            <button className="w-full flex items-center justify-between bg-ink/[0.03] hover:bg-ink/[0.06] px-4 py-3 rounded-xl text-sm text-ink/80 transition-colors">
              <span className="flex items-center gap-2"><KeyRound className="h-3.5 w-3.5" /> Change password</span>
              <span className="text-[10px] text-ink/45">→</span>
            </button>
            <button className="w-full flex items-center justify-between bg-ink/[0.03] hover:bg-ink/[0.06] px-4 py-3 rounded-xl text-sm text-ink/80 transition-colors">
              <span className="flex items-center gap-2"><LogOut className="h-3.5 w-3.5" /> Sign out everywhere</span>
              <span className="text-[10px] text-ink/45">→</span>
            </button>
          </Section>

          {/* Danger */}
          <Section icon={<AlertTriangle className="h-3.5 w-3.5" />} label="Danger Zone">
            {confirmDelete ? (
              <div className="bg-print-red/5 border border-print-red/30 p-4 rounded-xl space-y-3">
                <p className="text-xs text-ink/70">This permanently deletes your account, wallet balance, and game progress.</p>
                <div className="flex gap-2">
                  <button onClick={() => { toast.error("Account deletion requested"); setConfirmDelete(false); }}
                    className="flex-1 text-xs font-semibold bg-print-red text-paper py-2 rounded-lg">Delete forever</button>
                  <button onClick={() => setConfirmDelete(false)}
                    className="flex-1 text-xs font-semibold bg-ink/[0.06] text-ink/70 py-2 rounded-lg">Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(true)}
                className="w-full text-xs font-semibold bg-print-red/10 text-print-red py-3 rounded-xl hover:bg-print-red/15 transition-colors">
                Delete account
              </button>
            )}
          </Section>

          <div className="pt-2">
            <button
              onClick={handleLogOut}
              disabled={isLoggingOut}
              className="w-full text-xs font-semibold bg-print-red/10 text-print-red py-3 rounded-xl hover:bg-print-red hover:text-paper transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <LogOut className="h-3.5 w-3.5" /> {isLoggingOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/* ============================= EDITORIAL ================================== */

const EditorialSettings = ({ open, onOpenChange }: Props) => {
  const { profile, updateProfile } = useProfileQuery();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  // const [resetBest, setResetBest] = useState(false);
  const prefs = useLocalPrefs();
  const version: UIVersion = profile?.uiVersion ?? "editorial";

  const handleLogOut = () => {
    if (isLoggingOut) return;
    handleLogout(setIsLoggingOut, navigate, false);
  };

  const handleVersionSwitch = (newVersion: UIVersion) => {
    if (newVersion === version) return;
    updateProfile({ uiVersion: newVersion });
    onOpenChange(false);
    navigate(mapPath(location.pathname, newVersion));
    toast.success(`Switched to ${newVersion === "v3" ? "Modern" : "Editorial"} interface`);
  };

  const subPct = (MOCK.subscriptionDaysLeft / MOCK.subscriptionTotalDays) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-paper border-2 border-ink rounded-none w-[calc(100%-1.5rem)] sm:w-full max-w-xl p-0 gap-0 max-h-[calc(100dvh-2rem)] overflow-hidden flex flex-col [&>button]:text-ink [&>button]:opacity-100 [&>button]:top-3 sm:[&>button]:top-5 [&>button]:right-3 sm:[&>button]:right-5 [&>button]:hover:bg-ink [&>button]:hover:text-paper [&>button]:border-2 [&>button]:border-ink [&>button]:p-1">
        <div className="border-b-2 border-ink p-4 sm:p-5 bg-paper-deep/40 shrink-0">
          <DialogHeader className="space-y-0">
            <div className="flex items-baseline justify-between gap-3 min-w-0">
              <DialogTitle className="font-editorial text-2xl sm:text-4xl tracking-[-0.02em] leading-none text-ink truncate">
                SETTINGS
              </DialogTitle>
              <span className="font-mono-display text-[9px] uppercase tracking-[0.3em] text-ink/60 shrink-0">
                Sec. S
              </span>
            </div>
            <div className="font-mono-display text-[9px] uppercase tracking-[0.3em] text-ink/60 mt-2 border-t border-ink/30 pt-2">
              Configuration Desk · {new Date().getFullYear()}
            </div>
          </DialogHeader>
        </div>

        <div className="p-4 sm:p-5 space-y-6 overflow-y-auto flex-1">
          {/* Subscription */}
          <EdSection label="§ Subscription">
            <div className="border-2 border-ink p-4 space-y-3 bg-paper-deep/30">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="font-mono-display text-[9px] uppercase tracking-[0.3em] text-ink/60">Plan</div>
                  <div className="font-editorial italic text-2xl text-ink capitalize mt-1">{MOCK.subscriptionPlan}</div>
                </div>
                {MOCK.subscriptionPlan === "basic" && (
                  <button className="border-2 border-ink bg-print-red text-primary-foreground px-3 py-2 font-mono-display text-[10px] uppercase tracking-[0.25em] hover:opacity-90">
                    Upgrade
                  </button>
                )}
              </div>
              <div className="border-t-2 border-ink pt-3">
                <div className="flex justify-between font-mono-display text-[9px] uppercase tracking-[0.25em] text-ink/60 mb-1">
                  <span>{MOCK.subscriptionDaysLeft} days left</span>
                  <span>{MOCK.subscriptionTotalDays}d cycle</span>
                </div>
                <div className="h-2 w-full border-2 border-ink bg-paper overflow-hidden">
                  <div className="h-full bg-ink" style={{ width: `${subPct}%` }} />
                </div>
              </div>
            </div>
          </EdSection>

          {/* Notifications */}
          <EdSection label="§ Notifications">
            {/* <EdRow label="MASTER SWITCH">
              <EdCheckbox on={!!profile?.notificationsEnabled} disabled={!profile}
                onChange={(v) => updateProfile({ notificationsEnabled: v } as Partial<Profile>)} />
            </EdRow> */}
            <EdRow label="EMAIL RECEIPTS">
              <EdCheckbox on={!!profile?.emailReceipts} disabled={!profile}
                onChange={(v) => updateProfile({ emailReceipts: v } as Partial<Profile>)} />
            </EdRow>
            <EdRow label="SUBSCRIPTION EXPIRY">
              <EdCheckbox on={prefs.notif.subscriptionExpiry}
                onChange={(v) => prefs.setNotif({ ...prefs.notif, subscriptionExpiry: v })} />
            </EdRow>
            {/* <EdRow label="VENDOR UPDATES">
              <EdCheckbox on={prefs.notif.vendorUpdates}
                onChange={(v) => prefs.setNotif({ ...prefs.notif, vendorUpdates: v })} />
            </EdRow> */}
            {/* <EdRow label="SPIDER HUNT LEADERBOARD">
              <EdCheckbox on={prefs.notif.spiderLeaderboard}
                onChange={(v) => prefs.setNotif({ ...prefs.notif, spiderLeaderboard: v })} />
            </EdRow> */}
            {/* <EdRow label="REFERRAL PAYOUTS">
              <EdCheckbox on={prefs.notif.referralPayouts}
                onChange={(v) => prefs.setNotif({ ...prefs.notif, referralPayouts: v })} />
            </EdRow> */}
          </EdSection>

          {/* Game */}
          {/* <EdSection label="§ Spider Hunt">
            <EdRow label="SOUND EFFECTS">
              <EdCheckbox on={prefs.game.sound} onChange={(v) => prefs.setGame({ ...prefs.game, sound: v })} />
            </EdRow>
            <div>
              <div className="font-mono-display text-[10px] uppercase tracking-[0.2em] text-ink/80 mb-2">Default difficulty</div>
              <div className="grid grid-cols-3 gap-0 border-2 border-ink">
                {(["easy", "normal", "hard"] as const).map((d, i) => (
                  <button
                    key={d}
                    onClick={() => prefs.setGame({ ...prefs.game, difficulty: d })}
                    className={cn(
                      "py-2 font-mono-display text-[10px] uppercase tracking-[0.2em] transition-colors",
                      i > 0 && "border-l-2 border-ink",
                      prefs.game.difficulty === d ? "bg-ink text-paper" : "bg-paper text-ink hover:bg-ink/[0.05]"
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div className="border-2 border-ink p-3 flex items-center justify-between">
              <div>
                <div className="font-mono-display text-[9px] uppercase tracking-[0.3em] text-ink/60">Best score</div>
                <div className="font-editorial text-xl text-ink mt-1">{MOCK.spiderHuntBest.toLocaleString()}</div>
              </div>
              {resetBest ? (
                <div className="flex gap-1.5">
                  <button onClick={() => { toast.success("Best score reset"); setResetBest(false); }}
                    className="border-2 border-ink bg-print-red text-primary-foreground px-3 py-1.5 font-mono-display text-[10px] uppercase tracking-[0.25em]">Confirm</button>
                  <button onClick={() => setResetBest(false)}
                    className="border-2 border-ink px-3 py-1.5 font-mono-display text-[10px] uppercase tracking-[0.25em] hover:bg-paper-deep">Cancel</button>
                </div>
              ) : (
                <button onClick={() => setResetBest(true)}
                  className="border-2 border-ink px-3 py-1.5 font-mono-display text-[10px] uppercase tracking-[0.25em] hover:bg-ink hover:text-paper">
                  Reset
                </button>
              )}
            </div>
          </EdSection> */}

          {/* Interface */}
          <EdSection label="§ Interface Style">
            <div className="grid grid-cols-2 gap-0 border-2 border-ink">
              <SkinPreviewButton skin="editorial" active={version === "editorial"} onClick={() => handleVersionSwitch("editorial")} framed />
              <SkinPreviewButton skin="modern" active={version === "v3"} onClick={() => handleVersionSwitch("v3")} framed />
            </div>
          </EdSection>

          <EdSection label="§ Appearance">
            <ThemeToggle variant="editorial" />
          </EdSection>

          {/* Security */}
          <EdSection label="§ Security">
            <button className="w-full flex items-center justify-between border-2 border-ink px-4 py-3 hover:bg-ink hover:text-paper transition-colors">
              <span className="font-mono-display text-[10px] uppercase tracking-[0.25em] flex items-center gap-2">
                <KeyRound className="h-3 w-3" /> Change password
              </span>
              <span className="font-mono-display text-xs">→</span>
            </button>
            <button className="w-full flex items-center justify-between border-2 border-ink px-4 py-3 hover:bg-ink hover:text-paper transition-colors">
              <span className="font-mono-display text-[10px] uppercase tracking-[0.25em] flex items-center gap-2">
                <LogOut className="h-3 w-3" /> Sign out everywhere
              </span>
              <span className="font-mono-display text-xs">→</span>
            </button>
          </EdSection>

          {/* Danger */}
          <EdSection label="§ Danger Zone">
            {confirmDelete ? (
              <div className="border-2 border-print-red p-4 space-y-3 bg-print-red/5">
                <p className="font-mono-display text-[10px] uppercase tracking-[0.2em] text-ink/80 leading-relaxed">
                  This permanently deletes your account, wallet balance, and game progress.
                </p>
                <div className="flex gap-2">
                  <button onClick={() => { toast.error("Account deletion requested"); setConfirmDelete(false); }}
                    className="flex-1 border-2 border-ink bg-print-red text-primary-foreground py-2 font-mono-display text-[10px] uppercase tracking-[0.25em]">
                    Delete forever
                  </button>
                  <button onClick={() => setConfirmDelete(false)}
                    className="flex-1 border-2 border-ink py-2 font-mono-display text-[10px] uppercase tracking-[0.25em] hover:bg-paper-deep">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(true)}
                className="w-full border-2 border-print-red text-print-red py-3 font-mono-display text-[10px] uppercase tracking-[0.25em] hover:bg-print-red hover:text-paper transition-colors">
                Delete account
              </button>
            )}
          </EdSection>

          <div className="pt-4 border-t-2 border-ink">
            <button
              onClick={handleLogOut}
              disabled={isLoggingOut}
              className="w-full bg-print-red text-primary-foreground border-2 border-ink py-3 font-mono-display text-[10px] uppercase tracking-[0.25em] hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <LogOut className="h-3 w-3" /> {isLoggingOut ? "Signing Out…" : "Sign Out"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/* --------------------------- Skin preview buttons ------------------------- */

const SkinPreviewButton = ({
  skin, active, onClick, framed = false,
}: {
  skin: "modern" | "editorial";
  active: boolean;
  onClick: () => void;
  framed?: boolean;
}) => {
  if (skin === "modern") {
    return (
      <button
        onClick={onClick}
        aria-pressed={active}
        className={cn(
          "relative flex flex-col items-start gap-2 p-3 rounded-xl text-left transition-all",
          "bg-gradient-to-br from-paper to-paper-deep/40",
          framed ? "" : "border border-ink/10",
          active
            ? "ring-2 ring-print-red shadow-[0_10px_24px_-12px_hsl(var(--print-red)/0.45)]"
            : "hover:border-ink/25"
        )}
      >
        <span className="h-6 w-6 rounded-lg bg-gradient-to-br from-print-orange to-print-red shadow-sm" />
        <span className="font-v3-display text-sm font-semibold text-ink leading-tight">Modern</span>
        <span className="text-[10px] text-ink/55">Soft, rounded, gradient</span>
        {active && <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-print-red" />}
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "relative flex flex-col items-start gap-2 p-3 text-left transition-colors",
        framed ? "border-l-2 border-ink first:border-l-0" : "border-2 border-ink rounded-none",
        active ? "bg-ink text-paper" : "bg-paper text-ink hover:bg-ink/[0.04]"
      )}
    >
      <span className={cn("font-mono-display text-[9px] uppercase tracking-[0.3em]", active ? "text-paper/70" : "text-ink/60")}>
        Sec. E
      </span>
      <span className="font-editorial text-xl leading-none tracking-[-0.02em]">EDITORIAL</span>
      <span className={cn("font-mono-display text-[9px] uppercase tracking-[0.25em]", active ? "text-paper/70" : "text-ink/55")}>
        Serif · ruled · print
      </span>
    </button>
  );
};

/* --------------------------------- atoms --------------------------------- */

const Section = ({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) => (
  <section className="space-y-3">
    <h3 className="text-[11px] uppercase tracking-wider text-ink/50 flex items-center gap-2 font-semibold">
      {icon} {label}
    </h3>
    <div className="space-y-2.5">{children}</div>
  </section>
);

const V3Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex items-center justify-between bg-ink/[0.03] px-4 py-3 rounded-xl">
    <span className="text-sm text-ink/80">{label}</span>
    {children}
  </div>
);

const V3Toggle = ({
  on, onChange, disabled,
}: { on: boolean; onChange: (v: boolean) => void; disabled?: boolean }) => (
  <button
    onClick={() => onChange(!on)}
    disabled={disabled}
    className={cn(
      "w-10 h-6 rounded-full relative transition-colors disabled:opacity-50 shrink-0",
      on ? "bg-gradient-to-br from-print-red to-print-orange" : "bg-ink/15"
    )}
    aria-pressed={on}
  >
    <span className={cn(
      "absolute top-0.5 h-5 w-5 rounded-full bg-paper shadow transition-all",
      on ? "right-0.5" : "left-0.5"
    )} />
  </button>
);

const EdSection = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <section className="space-y-3">
    <h3 className="font-mono-display text-[9px] uppercase tracking-[0.3em] text-ink">{label}</h3>
    <div className="border-t-2 border-ink pt-3 space-y-3">{children}</div>
  </section>
);

const EdRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex items-center justify-between border-b border-ink/20 py-2">
    <span className="font-mono-display text-xs uppercase tracking-[0.2em] text-ink/80">{label}</span>
    {children}
  </div>
);

const EdCheckbox = ({
  on, onChange, disabled,
}: { on: boolean; onChange: (v: boolean) => void; disabled?: boolean }) => (
  <button
    onClick={() => onChange(!on)}
    disabled={disabled}
    className="font-mono-display text-sm border border-transparent hover:border-ink hover:bg-ink hover:text-paper px-1 transition-colors disabled:opacity-50"
    aria-pressed={on}
  >
    {on ? "[x]" : "[ ]"}
  </button>
);
