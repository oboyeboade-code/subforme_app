import { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";

export const V3Card = ({
  children,
  className,
  interactive,
  as: Tag = "div",
  ...rest
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  as?: any;
  [k: string]: any;
}) => (
  <Tag
    className={cn("v3-card p-6", interactive && "cursor-pointer", className)}
    {...rest}
  >
    {children}
  </Tag>
);

export const V3Pill = ({
  children,
  tone = "ink",
  className,
...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "ink" | "red" | "orange" | "green" | "paper";
}) => {
  const map: Record<string, string> = {
    ink: "bg-ink/[0.04] text-ink/70 border-ink/15",
    red: "bg-print-red/10 text-print-red border-print-red/25",
    orange: "bg-print-orange/15 text-[hsl(18,78%,38%)] border-print-orange/30",
    green: "bg-print-green/10 text-print-green border-print-green/25",
    paper: "bg-paper text-ink border-paper/40", // add this
  };

  return (
    <span
     {...props}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium",
        map[tone],
        className,
      )}
    >
      {children}
    </span>
  );
};

type BtnVariant = "primary" | "ghost" | "ink" | "soft" | "outline"; 
type BtnSize = "sm" | "md" | "lg";

interface V3ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  size?: BtnSize;
  fullWidth?: boolean;
  children: ReactNode;
  asChild?: boolean;
  isLoading?: boolean;
}

export const V3Button = ({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  children,
  asChild = false,
  isLoading = false,
  disabled,
 ...rest
}: V3ButtonProps) => {
  const Comp = asChild? Slot : "button";

  const sizes: Record<BtnSize, string> = {
    sm: "px-3.5 py-1.5 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const variants: Record<BtnVariant, string> = {
    primary:
      "text-paper bg-gradient-to-br from-print-red to-print-orange shadow-[0_10px_24px_-10px_hsl(var(--print-red)/0.55)] hover:brightness-105 hover:-translate-y-0.5",

    ghost:
      "text-ink bg-paper/60 border border-ink/15 hover:bg-paper hover:border-ink/30",

    ink:
      "text-paper bg-ink hover:bg-ink/85",

    soft:
      "text-ink bg-ink/[0.06] hover:bg-ink/[0.1] border border-transparent",

    outline: 
      "text-ink bg-transparent border border-ink/20 hover:bg-ink/[0.06] hover:border-ink/30",
  };

  return (
    <Comp
      disabled={disabled || isLoading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
        sizes[size],
        variants[variant],
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    >
      {isLoading? "Loading…" : children}
    </Comp>
  );
};

interface V3InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  icon?: React.ReactNode; 
}

export const V3Input = forwardRef<HTMLInputElement, V3InputProps>(
  ({ label, hint, error, icon, className, id,...rest }, ref) => {
    const inputId = id || rest.name;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-ink/70 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative"> 
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/50">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full rounded-xl border border-ink/12 bg-paper px-4 py-3 text- text-ink placeholder:text-ink/35 transition-all",
              "focus:outline-none focus:border-print-red/40 focus:ring-4 focus:ring-print-red/10",
              icon && "pl-10", 
              error && "border-print-red/60 focus:border-print-red focus:ring-print-red/15",
              className,
            )}
            {...rest}
          />
        </div>
        {hint &&!error && (
          <p className="mt-1.5 text- text-ink/55">{hint}</p>
        )}
        {error && (
          <p className="mt-1.5 text- text-print-red">{error}</p>
        )}
      </div>
    );
  },
);
V3Input.displayName = "V3Input";

export const V3SectionHeader = ({
  eyebrow,
  title,
  meta,
}: {
  eyebrow?: string;
  title: string;
  meta?: string;
}) => (
  <div className="mb-8 flex items-end justify-between gap-4 flex-wrap">
    <div>
      {eyebrow && (
        <p className="text-sm font-medium text-print-red">{eyebrow}</p>
      )}
      <h2 className="font-v3-display mt-2 text-3xl md:text-4xl tracking-tight">
        {title}
      </h2>
    </div>
    {meta && <p className="text-sm text-ink/55">{meta}</p>}
  </div>
);

export const V3Divider = ({ className }: { className?: string }) => (
  <div className={cn("v3-divider", className)} />
);
