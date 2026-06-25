import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, Loader2, AlertCircle, Ticket } from "lucide-react";
import { orderApi, paymentApi, cartApi, type Order } from "@/lib/api/";

const Paid = () => {
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
          setOrder(v.data);
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

  if (status === "polling") {
    return (
      <div className="relative overflow-hidden min-h-screen flex items-center justify-center px-6 py-16">
        <span
          aria-hidden
          className="absolute inset-0 flex items-center justify-center font-editorial italic text-[20rem] text-ink/5 leading-none select-none pointer-events-none"
        >
          Sfm
        </span>

        <article className="relative max-w-md w-full border-2 border-ink bg-card p-8 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-print-red mx-auto mb-6" />
          <h1 className="font-editorial text-3xl text-ink mb-3">
            Confirming your payment...
          </h1>
          <p className="text-muted-foreground">
            This usually takes a few seconds
          </p>
        </article>
      </div>
    );
  }

  if (status === "error" || !order) {
    return (
      <div className="relative overflow-hidden min-h-screen flex items-center justify-center px-6 py-16">
        <span
          aria-hidden
          className="absolute inset-0 flex items-center justify-center font-editorial italic text-[20rem] text-ink/5 leading-none select-none pointer-events-none"
        >
          Sfm
        </span>

        <article className="relative max-w-md w-full border-2 border-ink bg-card p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />

          <h1 className="font-editorial text-3xl text-ink mb-3">
            Couldn't confirm payment
          </h1>

          <p className="text-muted-foreground mb-2">
            If money left your account, contact support
          </p>

          {ref && (
            <p className="font-mono-display text-xs text-ink/60 mb-8">
              Ref: {ref}
            </p>
          )}

          <button
            onClick={() => navigate("/app/dashboard")}
            className="inline-block w-full bg-print-red text-primary-foreground border-2 border-ink py-3 font-mono-display text-sm uppercase tracking-[0.2em] hover:bg-print-red/90 transition-colors"
          >
            Back to Dashboard →
          </button>
        </article>
      </div>
    );
  }

  // SUCCESS STATE
  return (
    <div className="relative overflow-hidden min-h-screen flex items-center justify-center px-6 py-16">
      <span
        aria-hidden
        className="absolute inset-0 flex items-center justify-center font-editorial italic text-[20rem] text-ink/5 leading-none select-none pointer-events-none"
      >
        Sfm
      </span>

      <article className="relative max-w-md w-full border-2 border-ink bg-card p-8 text-center">
        <p className="font-mono-display text-sm uppercase tracking-[0.2em] text-print-green mb-3">
          Receipt · Confirmed
        </p>

        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />

        <h1 className="font-editorial text-4xl text-ink mb-3">
          Thanks for subscribing 🎉
        </h1>

        <p className="text-muted-foreground mb-6">
          Your payment was successful. Order {order.ref}
        </p>

        <div className="border-t-2 border-b-2 border-ink/10 py-4 my-6 text-left space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Amount Paid</span>
            <span className="font-mono-display text-ink">
              ₦{order.totalPaid?.toLocaleString()}
            </span>
          </div>

          {order.voucherCode && (
            <div className="flex justify-between items-center text-sm">
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

          <div className="flex justify-between text-xs text-ink/50 pt-2 border-t border-ink/10">
            <span>Paid on</span>
            <span>
              {order.paidAt ? new Date(order.paidAt).toLocaleString() : "—"}
            </span>
          </div>
        </div>

        <Link
          to="/app/dashboard"
          className="inline-block w-full bg-print-red text-primary-foreground border-2 border-ink py-3 font-mono-display text-sm uppercase tracking-[0.2em] hover:bg-print-red/90 transition-colors"
        >
          Go to dashboard →
        </Link>
      </article>
    </div>
  );
};

export default Paid;