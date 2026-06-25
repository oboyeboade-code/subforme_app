import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Variant = "v3" | "editorial" | "icon";

interface Props {
  variant?: Variant;
  className?: string;
}

const options = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "Auto", icon: Monitor },
] as const;

export const ThemeToggle = ({ variant = "v3", className }: Props) => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const active = mounted ? theme ?? "system" : "system";

  if (variant === "icon") {
    const next = (resolvedTheme === "dark" ? "light" : "dark");
    const Icon = resolvedTheme === "dark" ? Sun : Moon;
    return (
      <button
        type="button"
        onClick={() => setTheme(next)}
        aria-label={`Switch to ${next} mode`}
        className={cn(
          "h-9 w-9 rounded-xl flex items-center justify-center bg-ink/[0.04] hover:bg-ink/[0.08] text-ink/70 hover:text-ink transition-colors",
          className
        )}
      >
        <Icon className="h-4 w-4" />
      </button>
    );
  }

  if (variant === "editorial") {
    return (
      <div className={cn("flex border-2 border-ink", className)}>
        {options.map((opt, i) => {
          const Icon = opt.icon;
          const on = active === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTheme(opt.value)}
              className={cn(
                "flex-1 py-2.5 font-mono-display text-[10px] uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-1.5",
                i > 0 && "border-l-2 border-ink",
                on ? "bg-ink text-paper" : "bg-paper text-ink hover:bg-paper-deep"
              )}
              aria-pressed={on}
            >
              <Icon className="h-3 w-3" />
              {opt.label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn("flex p-1 bg-ink/[0.04] rounded-xl", className)}>
      {options.map((opt) => {
        const Icon = opt.icon;
        const on = active === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setTheme(opt.value)}
            className={cn(
              "flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5",
              on ? "bg-paper text-ink shadow-sm" : "text-ink/45 hover:text-ink"
            )}
            aria-pressed={on}
          >
            <Icon className="h-3.5 w-3.5" />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};
