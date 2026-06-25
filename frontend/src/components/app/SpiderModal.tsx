import { useEffect, useMemo, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Target, X, Coins, Flame, Zap } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { gameApi } from "@/lib/api/game.api";
import { useSWRConfig } from "swr";
import { toast } from "sonner";

/**
 * Utility for merging tailwind classes
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Styles for the Spider Hunt game
 * These are inlined to make the component self-contained.
 */
const SPIDER_HUNT_STYLES = `
  :root {
    --arcade-bg: oklch(0.16 0.05 285);
    --arcade-surface: oklch(0.22 0.08 295);
    --arcade-surface-2: oklch(0.28 0.10 300);
    --arcade-border: oklch(0.42 0.12 305);
    --arcade-neon: oklch(0.66 0.24 15);        /* hot red-pink */
    --arcade-neon-soft: oklch(0.66 0.24 15 / 0.35);
    --arcade-gold: oklch(0.86 0.17 90);
    --arcade-text: oklch(0.97 0.01 300);
    --arcade-muted: oklch(0.72 0.05 300);
    --gradient-arcade: radial-gradient(ellipse at top, oklch(0.26 0.12 300) 0%, oklch(0.10 0.04 285) 70%);
    --gradient-neon: linear-gradient(135deg, oklch(0.66 0.24 15), oklch(0.78 0.20 35));
    --gradient-gold: linear-gradient(135deg, oklch(0.86 0.17 90), oklch(0.92 0.15 75));
    --shadow-neon: 0 0 24px oklch(0.66 0.24 15 / 0.55), 0 0 48px oklch(0.66 0.24 15 / 0.25);
    --shadow-gold: 0 0 32px oklch(0.86 0.17 90 / 0.55);
  }

  .bg-web-pattern {
    background-image:
      radial-gradient(circle at 50% 50%, transparent 0, transparent 60px, oklch(0.66 0.24 15 / 0.06) 61px, transparent 62px),
      radial-gradient(circle at 50% 50%, transparent 0, transparent 100px, oklch(0.66 0.24 15 / 0.05) 101px, transparent 102px),
      radial-gradient(circle at 50% 50%, transparent 0, transparent 140px, oklch(0.66 0.24 15 / 0.04) 141px, transparent 142px),
      conic-gradient(from 0deg at 50% 50%, transparent 0deg, oklch(0.66 0.24 15 / 0.07) 1deg, transparent 2deg, transparent 45deg, oklch(0.66 0.24 15 / 0.07) 46deg, transparent 47deg, transparent 90deg, oklch(0.66 0.24 15 / 0.07) 91deg, transparent 92deg, transparent 135deg, oklch(0.66 0.24 15 / 0.07) 136deg, transparent 137deg, transparent 180deg, oklch(0.66 0.24 15 / 0.07) 181deg, transparent 182deg, transparent 225deg, oklch(0.66 0.24 15 / 0.07) 226deg, transparent 227deg, transparent 270deg, oklch(0.66 0.24 15 / 0.07) 271deg, transparent 272deg, transparent 315deg, oklch(0.66 0.24 15 / 0.07) 316deg, transparent 317deg);
  }
`;

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

type Difficulty = "easy" | "medium" | "hard";

const PRESETS: Record<
  Difficulty,
  { size: number; reward: number; label: string; sub: string }
> = {
  easy:   { size: 3, reward: 2,  label: "Novice", sub: "1 in 9" },
  medium: { size: 4, reward: 5,  label: "Expert", sub: "1 in 16" },
  hard:   { size: 5, reward: 10, label: "Master", sub: "1 in 25" },
};

const SpiderSVG = ({ size = 44 }: { size?: number }) => (
  <motion.svg
    initial={{ scale: 0, rotate: -45 }}
    animate={{ scale: 1, rotate: 0 }}
    transition={{ type: "spring", stiffness: 400, damping: 14 }}
    width={size}
    height={size}
    viewBox="0 0 40 40"
    style={{ filter: "drop-shadow(0 0 8px var(--arcade-neon))" }}
  >
    <circle cx="20" cy="22" r="6" fill="var(--arcade-neon)" />
    <circle cx="20" cy="14" r="4" fill="var(--arcade-neon)" />
    <circle cx="18.5" cy="13" r="0.8" fill="white" />
    <circle cx="21.5" cy="13" r="0.8" fill="white" />
    {[
      "M 16 18 Q 8 12 4 14", "M 16 20 Q 6 18 2 22",
      "M 16 22 Q 6 26 2 30", "M 16 24 Q 8 30 4 34",
      "M 24 18 Q 32 12 36 14", "M 24 20 Q 34 18 38 22",
      "M 24 22 Q 34 26 38 30", "M 24 24 Q 32 30 36 34",
    ].map((d, i) => (
      <motion.path
        key={i} d={d}
        stroke="var(--arcade-neon)" strokeWidth="2"
        strokeLinecap="round" fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.1 + i * 0.04 }}
      />
    ))}
  </motion.svg>
);

const CoinBurst = ({ amount }: { amount: number }) => (
  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
    {[...Array(8)].map((_, i) => {
      const angle = (i / 8) * Math.PI * 2;
      const dx = Math.cos(angle) * 60;
      const dy = Math.sin(angle) * 60;
      return (
        <motion.div
          key={i}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0.4 }}
          animate={{ x: dx, y: dy, opacity: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute"
          style={{
            color: "var(--arcade-gold)",
            filter: "drop-shadow(0 0 6px var(--arcade-gold))",
          }}
        >
          <Coins className="h-4 w-4" />
        </motion.div>
      );
    })}
    <motion.div
      initial={{ y: 0, opacity: 0, scale: 0.5 }}
      animate={{ y: -70, opacity: [0, 1, 1, 0], scale: 1.2 }}
      transition={{ duration: 1.1 }}
      className="absolute font-black text-2xl"
      style={{
        color: "var(--arcade-gold)",
        textShadow: "0 0 16px var(--arcade-gold)",
      }}
    >
      +{amount}
    </motion.div>
  </div>
);

export const SpiderModal = ({ open, onOpenChange }: Props) => {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [revealed, setRevealed] = useState<number | null>(null);
  const [spiderIndex, setSpiderIndex] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "won" | "lost">("idle");
  const [earned, setEarned] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [shake, setShake] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { mutate } = useSWRConfig();

  const { size, reward } = PRESETS[difficulty];
  const cells = useMemo(() => Array.from({ length: size * size }, (_, i) => i), [size]);
  const streakBonus = streak >= 2 ? streak : 0; // bonus coins on top
  const lastWinAmount = reward + streakBonus;

  const resetBoard = () => {
    setRevealed(null);
    setSpiderIndex(null);
    setStatus("idle");
  };

  // Start a new session when modal opens or difficulty changes
  useEffect(() => {
    if (open && !sessionId) {
      const startSession = async () => {
        try {
          setIsLoading(true);
          const res = await gameApi.startSpiderHunt(difficulty);
          setSessionId(res.data.sessionId);
          resetBoard();
          setEarned(0);
          setRounds(0);
          setStreak(0);
          setBestStreak(0);
        } catch (e) {
          toast.error("Failed to start game session");
          onOpenChange(false);
        } finally {
          setIsLoading(false);
        }
      };
      startSession();
    }
  }, [open, sessionId, difficulty, onOpenChange]);

  useEffect(() => {
    if (revealed !== null && status !== "idle") {
      const timer = setTimeout(resetBoard, 1600);
      return () => clearTimeout(timer);
    }
  }, [revealed, status]);

  const play = async (choice: number) => {
    if (revealed !== null || !sessionId || isLoading) return;
    setRevealed(choice);

    try {
      const res = await gameApi.playSpiderHunt({
        sessionId,
        choice,
        difficulty,
      });
      const data = res.data;
      setSpiderIndex(data.spiderIndex);

      if (data.won) {
        setStatus("won");
        setEarned((e) => e + data.reward);
        setStreak((s) => {
          const next = s + 1;
          setBestStreak((b) => Math.max(b, next));
          return next;
        });
      } else {
        setStatus("lost");
        setStreak(0);
        setShake(true);
        setTimeout(() => setShake(false), 400);
      }
      setRounds((r) => r + 1);
    } catch (e) {
      toast.error("Game failed");
      resetBoard();
    }
  };

  if (!open) return null;

  const Header = (
    <div className="flex items-center gap-3">
      <div
        className="p-2 rounded-xl"
        style={{
          background: "var(--arcade-neon-soft)",
          boxShadow: "var(--shadow-neon)",
        }}
      >
        <Target className="h-5 w-5" style={{ color: "var(--arcade-neon)" }} />
      </div>
      <div>
        <h1
          className="text-2xl font-black tracking-tight"
          style={{
            color: "var(--arcade-text)",
            textShadow: "0 0 12px var(--arcade-neon-soft)",
          }}
        >
          SPIDER HUNT
        </h1>
        <p className="text-[11px] uppercase tracking-[0.2em]" style={{ color: "var(--arcade-muted)" }}>
          Find it. Earn coins.
        </p>
      </div>
    </div>
  );

  const StatsRow = (
    <div className="grid grid-cols-3 gap-2">
      <div
        className="rounded-xl px-3 py-2.5 border"
        style={{ background: "var(--arcade-surface)", borderColor: "var(--arcade-border)" }}
      >
        <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--arcade-muted)" }}>
          Coins
        </p>
        <div className="flex items-center gap-1 mt-0.5">
          <Coins className="h-4 w-4" style={{ color: "var(--arcade-gold)" }} />
          <p className="text-xl font-black" style={{ color: "var(--arcade-gold)" }}>
            {earned}
          </p>
        </div>
      </div>
      <div
        className="rounded-xl px-3 py-2.5 border"
        style={{ background: "var(--arcade-surface)", borderColor: "var(--arcade-border)" }}
      >
        <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--arcade-muted)" }}>
          Streak
        </p>
        <div className="flex items-center gap-1 mt-0.5">
          <Flame
            className={cn("h-4 w-4", streak >= 2 && "animate-pulse")}
            style={{ color: streak >= 2 ? "var(--arcade-neon)" : "var(--arcade-muted)" }}
          />
          <p
            className="text-xl font-black"
            style={{ color: streak >= 2 ? "var(--arcade-neon)" : "var(--arcade-text)" }}
          >
            {streak}
          </p>
        </div>
      </div>
      <div
        className="rounded-xl px-3 py-2.5 border"
        style={{ background: "var(--arcade-surface)", borderColor: "var(--arcade-border)" }}
      >
        <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--arcade-muted)" }}>
          Rounds
        </p>
        <p className="text-xl font-black mt-0.5" style={{ color: "var(--arcade-text)" }}>
          {rounds}
        </p>
      </div>
    </div>
  );

  const DifficultyTabs = (
    <div
      className="grid grid-cols-3 gap-1 p-1 rounded-xl border"
      style={{ background: "var(--arcade-surface)", borderColor: "var(--arcade-border)" }}
    >
      {(Object.keys(PRESETS) as Difficulty[]).map((d) => {
        const active = difficulty === d;
        return (
          <button
            key={d}
            onClick={() => {
              setDifficulty(d);
              setSessionId(null); // trigger a new session for the new difficulty
            }}
            disabled={revealed !== null || isLoading}
            className={cn(
              "py-2 px-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50",
              active ? "text-white" : "hover:bg-white/5"
            )}
            style={{
              background: active ? "var(--gradient-neon)" : "transparent",
              color: active ? "white" : "var(--arcade-muted)",
              boxShadow: active ? "var(--shadow-neon)" : "none",
            }}
          >
            <div>{PRESETS[d].label}</div>
            <div className="text-[9px] opacity-80 font-medium">+{PRESETS[d].reward}c</div>
          </button>
        );
      })}
    </div>
  );

  const StatusBar = (
    <div
      className="h-14 rounded-xl border flex items-center justify-center px-4"
      style={{
        background: "var(--arcade-surface)",
        borderColor:
          status === "won"
            ? "var(--arcade-gold)"
            : status === "lost"
              ? "var(--arcade-neon)"
              : "var(--arcade-border)",
      }}
    >
      <AnimatePresence mode="wait">
        {status === "won" && (
          <motion.div
            key="won"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <Trophy className="h-5 w-5" style={{ color: "var(--arcade-gold)" }} />
            <span className="font-black text-base" style={{ color: "var(--arcade-gold)" }}>
              +{lastWinAmount} coins
            </span>
            {streakBonus > 0 && (
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: "var(--arcade-neon-soft)",
                  color: "var(--arcade-neon)",
                }}
              >
                <Zap className="inline h-3 w-3 -mt-0.5" /> +{streakBonus} streak
              </span>
            )}
          </motion.div>
        )}
        {status === "lost" && (
          <motion.div
            key="lost"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <p className="font-black text-sm" style={{ color: "var(--arcade-neon)" }}>
              Empty Web!
            </p>
            <p className="text-[11px]" style={{ color: "var(--arcade-muted)" }}>
              The spider was hiding elsewhere
            </p>
          </motion.div>
        )}
        {status === "idle" && (
          <motion.p
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs uppercase tracking-[0.25em]"
            style={{ color: "var(--arcade-muted)" }}
          >
            {streak >= 2 ? `🔥 ${streak} in a row — pick wisely` : "Tap a web to hunt"}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );

  const Grid = ({ cellSize }: { cellSize: number }) => (
    <motion.div
      animate={shake ? { x: [-4, 4, -3, 3, 0] } : {}}
      transition={{ duration: 0.4 }}
      className="relative bg-web-pattern rounded-2xl p-4"
      style={{
        background:
          "radial-gradient(circle at center, oklch(0.22 0.10 295 / 0.6), oklch(0.10 0.04 285 / 0.8))",
        border: "1px solid var(--arcade-border)",
      }}
    >
      {status === "won" && spiderIndex !== null && (
        <CoinBurst amount={lastWinAmount} />
      )}
      <div
        className="grid gap-2 mx-auto"
        style={{ gridTemplateColumns: `repeat(${size}, ${cellSize}px)` }}
      >
        {cells.map((i) => {
          const isSpider = spiderIndex === i;
          const isPicked = revealed === i;
          const isRevealed = revealed !== null;
          const isWrongPick = isPicked && status === "lost";
          return (
            <motion.button
              key={i}
              initial={{ opacity: 0, scale: 0.6, rotate: -15 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.04 * i, type: "spring", stiffness: 300, damping: 20 }}
              whileHover={!isRevealed ? { scale: 1.08, y: -2 } : {}}
              whileTap={!isRevealed ? { scale: 0.92 } : {}}
              onClick={() => play(i)}
              disabled={isRevealed || isLoading || !sessionId}
              className={cn(
                "relative rounded-xl flex items-center justify-center overflow-hidden transition-colors",
                !isRevealed && "cursor-pointer"
              )}
              style={{
                width: cellSize,
                height: cellSize,
                background: isSpider
                  ? "radial-gradient(circle, var(--arcade-neon-soft), oklch(0.22 0.08 295))"
                  : isWrongPick
                    ? "oklch(0.30 0.05 280)"
                    : "linear-gradient(145deg, oklch(0.26 0.10 300), oklch(0.18 0.06 290))",
                border: isSpider
                  ? "2px solid var(--arcade-neon)"
                  : isWrongPick
                    ? "2px solid oklch(0.40 0.05 280)"
                    : "2px solid var(--arcade-border)",
                boxShadow: isSpider
                  ? "var(--shadow-neon), inset 0 0 20px var(--arcade-neon-soft)"
                  : !isRevealed
                    ? "inset 0 1px 0 oklch(1 0 0 / 0.06), 0 2px 8px oklch(0 0 0 / 0.4)"
                    : "none",
                opacity: isRevealed && !isSpider && !isPicked ? 0.4 : 1,
              }}
            >
              {/* idle dot indicator */}
              {!isRevealed && (
                <div
                  className="h-1.5 w-1.5 rounded-full opacity-40"
                  style={{ background: "var(--arcade-neon)" }}
                />
              )}
              <AnimatePresence>
                {isSpider && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.3 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <SpiderSVG size={Math.floor(cellSize * 0.65)} />
                  </motion.div>
                )}
              </AnimatePresence>
              {isWrongPick && !isSpider && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-2xl font-black"
                  style={{ color: "var(--arcade-muted)" }}
                >
                  ✕
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: SPIDER_HUNT_STYLES }} />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
        style={{ background: "var(--gradient-arcade)" }}
        ref={containerRef}
      >
        {/* ambient glow */}
        <div
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-30 blur-3xl"
          style={{ background: "var(--arcade-neon)" }}
        />

        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 p-2 rounded-lg transition-colors z-20"
          style={{ background: "var(--arcade-surface)", color: "var(--arcade-text)" }}
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <motion.div
          initial={{ y: 20, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          className="relative w-full max-w-md flex flex-col gap-4 p-5 rounded-3xl border"
          style={{
            background: "linear-gradient(180deg, oklch(0.20 0.07 295 / 0.95), oklch(0.14 0.05 285 / 0.95))",
            borderColor: "var(--arcade-border)",
            boxShadow: "0 30px 80px oklch(0 0 0 / 0.6), 0 0 0 1px oklch(1 0 0 / 0.04)",
            backdropFilter: "blur(12px)",
          }}
        >
          {Header}
          {StatsRow}
          {DifficultyTabs}

          <div className="flex justify-center">
            <Grid cellSize={size === 3 ? 80 : size === 4 ? 64 : 52} />
          </div>

          {StatusBar}

          {bestStreak >= 3 && (
            <div
              className="text-center text-[11px] uppercase tracking-widest"
              style={{ color: "var(--arcade-gold)" }}
            >
              🏆 Best streak: {bestStreak}
            </div>
          )}

          <AnimatePresence>
            {rounds > 0 && revealed === null && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                onClick={async () => {
                  if (earned > 0 && sessionId) {
                    try {
                      setIsLoading(true);
                      const res = await gameApi.cashoutSpiderHunt({ sessionId });
                      const { balance, coinsEarned } = res.data;
                      mutate("coins/balance", { balance }, false);
                      toast.success(`Successfully cashed out ${coinsEarned} coins!`);
                      setEarned(0);
                      setRounds(0);
                      setStreak(0);
                      setSessionId(null);
                    } catch {
                      toast.error("Cashout failed. Try again.");
                    } finally {
                      setIsLoading(false);
                      onOpenChange(false);
                    }
                  } else {
                    onOpenChange(false);
                  }
                }}
                disabled={isLoading}
                className="w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest text-white transition-transform hover:scale-[1.02] disabled:opacity-50"
                style={{
                  background: "var(--gradient-neon)",
                  boxShadow: "var(--shadow-neon)",
                }}
              >
                {isLoading ? "Processing..." : `Cash out ${earned} coins`}
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </>
  );
};

export default SpiderModal;
