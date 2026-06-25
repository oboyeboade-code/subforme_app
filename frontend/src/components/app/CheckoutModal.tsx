import { FormEvent, useEffect, useState } from "react";
import { X, Minus, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cartApi, paymentApi, voucherApi, type Profile, type Service } from "@/lib/api/";
import { useQueryClient } from "@tanstack/react-query";
import { useSWRConfig } from "swr";

export type CheckoutItem = Service & { qty: number };

interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CheckoutItem[];
  standalone?: boolean;
  onSuccess?: () => void;
}

type PerItem = { location: string; date: string };

const BRANCHES = ["Ikeja Branch", "Yaba Branch", "Lekki Branch"];

export const CheckoutModal = ({
  open,
  onOpenChange,
  items,
  standalone = false,
  onSuccess,
}: CheckoutModalProps) => {
  const { mutate } = useSWRConfig();
  const queryClient = useQueryClient();
  const profile = queryClient.getQueryData<Profile>(["profile"]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [perItem, setPerItem] = useState<Record<string, PerItem>>({});
  const [localQty, setLocalQty] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);

  // Voucher state (parity with V3)
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState<{
    code: string;
    discount: number;
  } | null>(null);

  const getTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0]; // YYYY-MM-DD
  };

  const minDate = getTomorrow();

  useEffect(() => {
    if (profile?.email && !email) setEmail(profile.email);
    if (profile?.name && !name) setName(profile.name);
  }, [profile]);

  useEffect(() => {
    if (!open) return;
    const defaultDate = getTomorrow();

    setPerItem((prev) => {
      const next: Record<string, PerItem> = {};
      items.forEach((i) => {
        next[i._id] = prev[i._id] ?? { location: "", date: defaultDate };
      });
      return next;
    });
    setLocalQty((prev) => {
      const next: Record<string, number> = {};
      items.forEach((i) => {
        next[i._id] = prev[i._id] ?? i.qty;
      });
      return next;
    });
    setAppliedVoucher(null);
    setVoucherCode("");
  }, [open, items]);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  if (!open) return null;

  const getQty = (id: string, fallback: number) =>
    standalone ? localQty[id] ?? fallback : fallback;

  const updateQty = async (id: string, qty: number) => {
    const next = Math.max(1, Math.min(99, qty));
    if (standalone) {
      setLocalQty((prev) => ({ ...prev, [id]: next }));
    } else {
      // Optimistic update for immediate feedback
      setLocalQty((prev) => ({ ...prev, [id]: next }));
      try {
        await cartApi.updateCartItem(id, next);
        mutate('customer/cart'); // Refresh SWR cart data
      } catch (err: any) {
        toast.error("Failed to update cart");
        // Revert local qty on error
        setLocalQty((prev) => ({ ...prev, [id]: items.find(i => i._id === id)?.qty || next }));
      }
    }
  };

  const subtotal = items.reduce(
    (sum, i) => sum + i.priceNaira * getQty(i._id, i.qty),
    0
  );
  const total = appliedVoucher ? subtotal - appliedVoucher.discount : subtotal;
  const totalUnits = items.reduce((sum, i) => sum + getQty(i._id, i.qty), 0);

  const updateItem = (id: string, patch: Partial<PerItem>) =>
    setPerItem((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return;
    setVoucherLoading(true);
    try {
      const res = await voucherApi.validateVoucher(voucherCode, subtotal);
      setAppliedVoucher({
        code: res.data.code,
        discount: res.data.discountApplied,
      });
      toast.success(
        `Voucher applied · ₦${res.data.discountApplied.toLocaleString()} off`
      );
      setVoucherCode("");
    } catch (e: any) {
      toast.error(e.message || "Could not apply voucher");
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    // Validate all dates are future dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const item of items) {
      const itemDate = perItem[item._id]?.date;
      if (!itemDate) {
        toast.error(`Pick a date for ${item.name}`);
        return;
      }

      const selectedDate = new Date(itemDate);
      selectedDate.setHours(0, 0, 0, 0);

      if (selectedDate <= today) {
        toast.error(`Pick a future date for ${item.name}. Today/past dates not allowed.`);
        return;
      }

      if (!perItem[item._id]?.location) {
        toast.error(`Pick a branch for ${item.name}`);
        return;
      }
    }

    if (!profile?._id || !profile?.email) {
      toast.error("Please log in to continue");
      return;
    }
    setSubmitting(true);
    try {
      const res = await paymentApi.initPayment({
        items: items.map((i) => ({
          serviceId: i._id,
          qty: getQty(i._id, i.qty),
          branch: perItem[i._id]?.location,
          date: perItem[i._id]?.date,
        })),
        cartTotal: subtotal,
        discountApplied: appliedVoucher?.discount || 0,
        voucherCode: appliedVoucher?.code,
        email,
        callbackPath: "/app/paid",
      });
      onSuccess?.();
      onOpenChange(false);
      window.location.href = res.data.authorization_url;
    } catch (err: any) {
      setSubmitting(false);
      toast.error(err.message || "Could not start payment");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={() => onOpenChange(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl my-auto border-2 border-ink bg-paper shadow-2xl"
      >
        <header className="border-b-2 border-ink px-6 py-4 flex items-start justify-between gap-3">
          <div>
            <p className="font-mono-display text-xs uppercase tracking-[0.2em] text-print-red mb-1">
              {standalone ? "Direct payment" : "Cart checkout"}
            </p>
            <h2 className="font-editorial text-3xl text-ink leading-tight">
              {standalone ? "Pay for service" : "Checkout cart"}
            </h2>
            <p className="font-mono-display text-xs uppercase tracking-[0.2em] text-muted-foreground mt-1">
              {totalUnits} unit{totalUnits === 1 ? "" : "s"} · ₦ {total.toLocaleString()}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="border-2 border-ink p-2 hover:bg-ink hover:text-paper transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full name">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputCls}
                placeholder="Ada Aluwe"
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
                placeholder="ada@mail.com"
              />
            </Field>
            {/* Removed the global Preferred date field - it's per-item */}
          </div>

          <div>
            <p className="font-mono-display text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
              Per-item booking
            </p>

            {items.length === 0 ? (
              <p className="border-2 border-dashed border-ink/30 px-4 py-6 text-center font-mono-display text-xs uppercase tracking-wider text-ink/60">
                Cart is empty
              </p>
            ) : (
              <ul className="space-y-4">
                {items.map((item, idx) => {
                  const q = getQty(item._id, item.qty);
                  const vendorName =
                    (item.vendorBusinessId as any)?.businessName ||
                    "Unknown Vendor";

                  return (
                    <li key={item._id} className="border-2 border-ink bg-card">
                      <div className="px-4 py-3 border-b-2 border-ink flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-14 w-14 object-cover border-2 border-ink shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-mono-display text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            Item · {String(idx + 1).padStart(2, "0")}
                          </p>
                          <h3 className="font-editorial text-lg text-ink truncate">
                            {item.name}
                            <span className="text-ink/60 text-sm">
                              {" "}· {vendorName}
                            </span>
                          </h3>
                        </div>
                        <span className="font-mono-display text-xs uppercase tracking-wider text-ink/70 shrink-0">
                          ₦ {(item.priceNaira * q).toLocaleString()}
                        </span>
                        {!standalone && (
                          <button
                            type="button"
                            onClick={async () => {
                                try {
                                    await cartApi.removeFromCart(item._id);
                                    mutate('customer/cart');
                                } catch (e) {
                                    toast.error("Could not remove item");
                                }
                            }}
                            className="border-2 border-ink p-2 hover:bg-print-red hover:text-paper transition-colors shrink-0"
                            aria-label="Remove item"
                            title="Remove from cart"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4">
                        <Field label="Quantity">
                          <div className="inline-flex items-center border-2 border-ink w-full">
                            <button
                              type="button"
                              onClick={() => updateQty(item._id, q - 1)}
                              className="h-10 w-10 flex items-center justify-center hover:bg-ink hover:text-paper transition-colors shrink-0"
                              aria-label="Decrease"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="flex-1 text-center font-mono-display text-sm text-ink">
                              {q}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQty(item._id, q + 1)}
                              className="h-10 w-10 flex items-center justify-center hover:bg-ink hover:text-paper transition-colors shrink-0"
                              aria-label="Increase"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </Field>
                        <Field label="Branch">
                          <select
                            required
                            value={perItem[item._id]?.location ?? ""}
                            onChange={(e) =>
                              updateItem(item._id, { location: e.target.value })
                            }
                            className={inputCls}
                          >
                            <option value="" disabled>
                              Choose a branch
                            </option>
                            {BRANCHES.map((b) => (
                              <option key={b}>{b}</option>
                            ))}
                          </select>
                        </Field>
                        <Field label="Preferred date">
                          <input
                            type="date"
                            required
                            min={minDate}
                            value={perItem[item._id]?.date ?? ""}
                            onChange={(e) =>
                              updateItem(item._id, { date: e.target.value })
                            }
                            className={inputCls}
                          />
                        </Field>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Voucher (parity with V3) */}
          <div className="border-t-2 border-ink pt-4 space-y-3">
            <p className="font-mono-display text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Voucher code
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                placeholder="VCH-XXXXXXXX"
                disabled={!!appliedVoucher || voucherLoading}
                className={`${inputCls} uppercase`}
              />
              <button
                type="button"
                onClick={handleApplyVoucher}
                disabled={voucherLoading || !!appliedVoucher || !voucherCode}
                className="border-2 border-ink bg-ink text-paper px-4 font-mono-display text-xs uppercase tracking-[0.2em] hover:bg-ink/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                {voucherLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Apply"
                )}
              </button>
            </div>

            {appliedVoucher && (
              <div className="flex items-center justify-between border-2 border-ink bg-paper-deep px-3 py-2 font-mono-display text-xs uppercase tracking-wider text-ink">
                <span>{appliedVoucher.code}</span>
                <div className="flex items-center gap-3">
                  <span>-₦ {appliedVoucher.discount.toLocaleString()}</span>
                  <button
                    type="button"
                    onClick={() => setAppliedVoucher(null)}
                    className="hover:text-print-red"
                    aria-label="Remove voucher"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Totals breakdown */}
          <div className="border-t-2 border-ink pt-4 space-y-2">
            <div className="flex justify-between font-mono-display text-xs uppercase tracking-wider text-ink/70">
              <span>Subtotal</span>
              <span>₦ {subtotal.toLocaleString()}</span>
            </div>
            {appliedVoucher && (
              <div className="flex justify-between font-mono-display text-xs uppercase tracking-wider text-print-red">
                <span>Voucher discount</span>
                <span>-₦ {appliedVoucher.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex items-center justify-between gap-3 pt-2">
              <div>
                <p className="font-mono-display text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Total due
                </p>
                <p className="font-editorial text-2xl text-ink">
                  ₦ {total.toLocaleString()}
                </p>
              </div>
              <button
                type="submit"
                disabled={submitting || items.length === 0}
                className="bg-print-red text-primary-foreground border-2 border-ink px-6 py-3 font-mono-display text-xs uppercase tracking-[0.2em] hover:bg-print-red/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Processing…" : "Confirm payment →"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const inputCls =
  "w-full border-2 border-ink bg-paper px-3 py-2.5 font-mono-display text-sm text-ink outline-none focus:bg-paper-deep";

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <label className="block">
    <span className="font-mono-display text-xs uppercase tracking-[0.2em] text-muted-foreground block mb-1.5">
      {label}
    </span>
    {children}
  </label>
);
