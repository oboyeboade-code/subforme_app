import { Loader2 } from "lucide-react";

type FullPageLoaderProps = {
  text?: string;
};

const FullPageLoader = ({ text = "Loading..." }: FullPageLoaderProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-paper text-ink gap-3">
      <Loader2 className="w-8 h-8 animate-spin" />
      <span className="text-xs uppercase tracking-wider font-mono-display text-ink/60">
        {text}
      </span>
    </div>
  );
};

export default FullPageLoader;