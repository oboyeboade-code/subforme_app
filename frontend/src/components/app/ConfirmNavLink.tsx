import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, ArrowRight } from "lucide-react";
import { V3Button } from "@/components/v3/V3UI";
import { cn } from "@/lib/utils";

interface ConfirmNavLinkProps {
  to: string; // internal route or external url
  children: React.ReactNode;
  confirmTitle: string;
  confirmDescription: string;
  confirmText?: string;
  cancelText?: string;
  external?: boolean; // set true for https:// links
  className?: string;
}

export const ConfirmNavLink = ({
  to,
  children,
  confirmTitle,
  confirmDescription,
  confirmText = "Continue",
  cancelText = "Cancel",
  external = false,
  className,
}: ConfirmNavLinkProps) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleConfirm = () => {
    setOpen(false);
    if (external || to.startsWith("http")) {
      window.open(to, "_blank", "noopener,noreferrer");
    } else {
      navigate(to); // SPA nav, no page refresh
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn("text-left", className)}
      >
        {children}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink/45 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-2xl bg-paper border border-ink/12 shadow-[0_30px_80px_-20px_hsl(var(--ink)/0.25)] overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-ink/6 flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-print-orange/10 flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-5 w-5 text-print-orange" />
                </div>
                <div className="flex-1">
                  <h3 className="font-v3-display text-lg text-ink">{confirmTitle}</h3>
                  <p className="text-sm text-ink/70 mt-1">{confirmDescription}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="h-8 w-8 rounded-full hover:bg-ink/5 flex items-center justify-center"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="px-6 py-4 flex items-center justify-end gap-3 bg-ink/[0.02]">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 h-10 rounded-full border border-ink/12 text-sm font-medium hover:bg-ink/5"
                >
                  {cancelText}
                </button>
                <V3Button onClick={handleConfirm} className="min-w-32">
                  {confirmText}
                  <ArrowRight className="h-4 w-4" />
                </V3Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};