export const AppLogo = ({
  className = "",
  inline = false
}: {
  className?: string;
  inline?: boolean;
}) => {
  if (inline) {
    return (
      <span className={`font-editorial!normal-case tracking-tight ${className}`}>
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
    <span
      className={`font-editorial text-2xl leading-none!normal-case tracking-tight inline-flex items-center ${className}`}
    >
      <img
        src="/logo.png"
        alt="Subforme logo"
        aria-hidden="true"
        className="h-[1em] w-[1em] -translate-y-[2px] object-contain shrink-0 mr-1"
      />
      <span>
        <span className="text-print-red italic">Sub</span>
        <span className="text-emerald-600">for</span>
        <span className="text-print-orange italic">me</span>
      </span>
      <span className="ml-1 h-1.5 w-1.5 rounded-full bg-gradient-to-br from-print-red to-print-orange -translate-y-[3px]" />
    </span>
  );
};