import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Loader2, Ticket, AlertCircle, ArrowRight } from "lucide-react";
import { orderApi, paymentApi, cartApi, type Order } from "@/lib/api/";
import { V3Card, V3Pill, V3Button } from "@/components/v3/V3UI";

const V3Paid = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const ref = searchParams.get("ref");

  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState<"polling" | "success" | "error">(
    "polling"
  );

  useEffect(() => {
    if (!ref) {
      setStatus("error");
      return;
    }

    let attempts = 0;
    let cancelled = false;
    let cartCleared = false;

    const clearCartOnce = async () => {
      if (!cartCleared) {
        await cartApi.clearCart();
        cartCleared = true;
      }
    };

    const poll = async () => {
      if (cancelled) return;

      try {
        const res = await orderApi.getOrderByRef(ref);

        if (res?.data?.status === "paid") {
          setOrder(res.data);
          setStatus("success");
          await clearCartOnce();
          return;
        }
      } catch {}

      attempts++;

      if (attempts < 8 && !cancelled) {
        setTimeout(poll, 2000);
      } else if (!cancelled) {
        setStatus("error");
      }
    };

    (async () => {
      try {
        const v = await paymentApi.verifyPayment(ref);

        if (!cancelled && v?.data?.status === "paid") {
          setOrder(v.data as Order);
          setStatus("success");
          await clearCartOnce();
          return;
        }
      } catch {}

      poll();
    })();

    return () => {
      cancelled = true;
    };
  }, [ref]);

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center px-5 py-16 overflow-hidden">
      <span
        aria-hidden
        className="absolute inset-0 flex items-center justify-center font-v3-display text-[40vw] text-ink/[0.03] leading-none select-none pointer-events-none tracking-tighter"
      >
        SFM
      </span>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 22 }}
        className="relative w-full max-w-md"
      >
        <V3Card className="p-8 md:p-10 text-center">
          {/* POLLING */}
          {status === "polling" && (
            <>
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  delay: 0.15,
                  type: "spring",
                  stiffness: 220,
                  damping: 14,
                }}
                className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-print-red to-print-orange flex items-center justify-center mb-6"
              >
                <Loader2
                  className="h-10 w-10 text-paper animate-spin"
                  strokeWidth={3}
                />
              </motion.div>

              <V3Pill tone="red" className="mb-3">
                Verifying
              </V3Pill>

              <h1 className="font-v3-display text-3xl md:text-4xl mb-3">
                Confirming your payment...
              </h1>

              <p className="text-ink/65">
                This usually takes a few seconds
              </p>
            </>
          )}

          {/* ERROR */}
          {status === "error" && (
            <>
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  delay: 0.15,
                  type: "spring",
                  stiffness: 220,
                  damping: 14,
                }}
                className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mb-6"
              >
                <AlertCircle className="h-10 w-10 text-paper" strokeWidth={3} />
              </motion.div>

              <V3Pill tone="red" className="mb-3">
                Payment Issue
              </V3Pill>

              <h1 className="font-v3-display text-3xl md:text-4xl mb-3">
                Couldn't confirm payment
              </h1>

              <p className="text-ink/65 mb-7">
                If money left your account, contact support with ref: {ref}
              </p>

              <V3Button size="lg" fullWidth onClick={() => navigate("/v3/app")}>
                Back to Home
              </V3Button>
            </>
          )}

          {/* SUCCESS */}
          {status === "success" && order && (
            <>
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  delay: 0.15,
                  type: "spring",
                  stiffness: 220,
                  damping: 14,
                }}
                className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-print-green to-print-orange flex items-center justify-center mb-6"
              >
                <Check className="h-10 w-10 text-paper" strokeWidth={3} />
              </motion.div>

              <V3Pill tone="green" className="mb-3">
                Receipt · Confirmed
              </V3Pill>

              <h1 className="font-v3-display text-3xl md:text-4xl mb-2">
                Payment Confirmed
              </h1>

              <p className="text-sm text-ink/60 mb-6">
                Order {order.ref}
              </p>

              <div className="rounded-2xl border border-ink/12 p-5 space-y-3 text-left mb-7">
                <div className="flex justify-between text-sm">
                  <span className="text-ink/70">Amount Paid</span>
                  <span className="font-v3-display text-lg">
                    ₦{order.totalPaid.toLocaleString()}
                  </span>
                </div>

                {order.voucherCode && (
                  <div className="flex justify-between items-center pt-3 border-t border-ink/6 text-sm">
                    <span className="flex items-center gap-1.5 text-green-600">
                      <Ticket className="h-4 w-4" />
                      Voucher Used
                    </span>

                    <div className="text-right">
                      <p className="font-medium text-green-600">
                        {order.voucherCode}
                      </p>
                      <p className="text-xs text-green-600/70">
                        -₦{order.voucherDiscount?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-between text-xs text-ink/50 pt-2 border-t border-ink/6">
                  <span>Paid on</span>
                  <span>
                    {order.paidAt
                      ? new Date(order.paidAt).toLocaleString()
                      : "—"}
                  </span>
                </div>
              </div>

              <Link to="/v3/app" className="block">
                <V3Button size="lg" fullWidth>
                  Continue Shopping <ArrowRight className="h-4 w-4" />
                </V3Button>
              </Link>
            </>
          )}
        </V3Card>
      </motion.div>
    </div>
  );
};

export default V3Paid;