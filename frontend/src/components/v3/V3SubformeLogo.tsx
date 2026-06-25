export const V3AppLogo = ({ 
  className = "", 
  inline = false 
}: { 
  className?: string;
  inline?: boolean;
}) => {
  if (inline) {
    return (
      <span className={`font-v3-display font-semibold!normal-case tracking-tight ${className}`}>
        <img
          src="/logo.png"
          alt=""
          aria-hidden="true"
          className="inline-block h-[1em] w-[1em] object-contain align-[-0.12em] mr-1"
        />
        <span className="text-print-red italic">Sub</span>
        <span className="text-emerald-600">for</span>
        <span className="text-print-orange italic">me</span>
        <span className="ml-1 inline-block h-[0.3em] w-[0.3em] rounded-full bg-gradient-to-br from-print-red to-print-orange align-[0.25em]" />
      </span>
    );
  }

  return (
    <span className={`font-v3-display text-xl font-semibold!normal-case tracking-tight inline-flex items-center gap-2 ${className}`}>
      <img src="/logo.png" alt="" className="h-6 w-6 rounded-md object-contain shrink-0" />
      <span className="inline-flex items-center">
        <span className="text-print-red italic">Sub</span>
        <span className="text-emerald-600">for</span>
        <span className="text-print-orange italic">me</span>
        <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-gradient-to-br from-print-red to-print-orange" />
      </span>
    </span>
  );
};