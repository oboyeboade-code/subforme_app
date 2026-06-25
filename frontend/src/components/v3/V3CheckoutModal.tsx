import { FormEvent, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, MapPin, Calendar, ShoppingBag, Minus, Plus, Ticket, Loader2 } from "lucide-react";
import { cartApi, paymentApi, voucherApi, type Profile, type Service } from "@/lib/api/";
import { toast } from "@/hooks/use-toast";
import { V3Button } from "./V3UI";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useSWRConfig } from "swr";

export type V3CheckoutItem = Service & { qty: number };

interface V3CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: V3CheckoutItem[];
  standalone?: boolean;
  onSuccess?: () => void;
}

type PerItem = { location: string; date: string };

const BRANCHES = ["Ikeja Branch", "Yaba Branch", "Lekki Branch"];

export const V3CheckoutModal = ({
  open,
  onOpenChange,
  items,
  standalone = false,
  onSuccess
}: V3CheckoutModalProps) => {
  const { mutate } = useSWRConfig();
  const queryClient = useQueryClient()
  const profile = queryClient.getQueryData<Profile>(["profile"]);
  const [perItem, setPerItem] = useState<Record<string, PerItem>>({});
  const [localQty, setLocalQty] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);

  const [voucherCode, setVoucherCode] = useState("");
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState<{
    code: string;
    discount: number;
  } | null>(null);

  useEffect(() => {
    if (!open) return;

    // Default to tomorrow
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 1);
    const defaultDateStr = defaultDate.toISOString().split("T")[0];

    setPerItem((prev) => {
      const next: Record<string, PerItem> = {};
      items.forEach((i) => {
        next[i._id] = prev[i._id]?? { location: "", date: defaultDateStr };
      });
      return next;
    });
    setLocalQty((prev) => {
      const next: Record<string, number> = {};
      items.forEach((i) => {
        next[i._id] = prev[i._id]?? i.qty;
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

  const getQty = (id: string, fallback: number) =>
    standalone? localQty[id]?? fallback : fallback;

  const updateQty = async (id: string, qty: number) => {
    const next = Math.max(1, Math.min(99, qty));
    if (standalone) {
      setLocalQty((prev) => ({...prev, [id]: next }));
    } else {
      // Optimistic update
      setLocalQty((prev) => ({ ...prev, [id]: next }));
      try {
        await cartApi.updateCartItem(id, next);
        mutate('customer/cart'); // Refresh SWR cart data
      } catch (err: any) {
        toast({ title: "Failed to update", description: err.message, variant: "destructive" });
        // Revert local qty
        setLocalQty((prev) => ({ ...prev, [id]: items.find(i => i._id === id)?.qty || next }));
      }
    }
  };

  const subtotal = items.reduce((sum, i) => sum + i.priceNaira * getQty(i._id, i.qty), 0);
  const total = appliedVoucher? subtotal - appliedVoucher.discount : subtotal;
  const totalUnits = items.reduce((sum, i) => sum + getQty(i._id, i.qty), 0);

  const updateItem = (id: string, patch: Partial<PerItem>) =>
    setPerItem((prev) => ({...prev, [id]: {...prev[id],...patch } }));

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return;
    setVoucherLoading(true);
    try {
      const res = await voucherApi.validateVoucher(voucherCode, subtotal);
      setAppliedVoucher({
        code: res.data.code,
        discount: res.data.discountApplied,
      });
      toast({
        title: "Voucher applied",
        description: `₦${res.data.discountApplied.toLocaleString()} discount`,
      });
      setVoucherCode("");
    } catch (e: any) {
      toast({
        title: "Invalid voucher",
        description: e.message || "Could not apply voucher",
        variant: "destructive",
      });
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    // Validate dates are in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const item of items) {
      const dateStr = perItem[item._id]?.date;
      if (!dateStr) {
        toast({
          title: "Missing date",
          description: `Please select a date for ${item.name}.`,
          variant: "destructive",
        });
        return;
      }

      const selectedDate = new Date(dateStr);
      selectedDate.setHours(0, 0, 0, 0);

      if (selectedDate <= today) {
        toast({
          title: "Invalid date",
          description: `Please select a future date for ${item.name}. Today or past dates aren't allowed.`,
          variant: "destructive",
        });
        return;
      }

      if (!perItem[item._id]?.location) {
        toast({
          title: "Missing branch",
          description: `Please select a branch for ${item.name}.`,
          variant: "destructive",
        });
        return;
      }
    }

    if (!profile?._id ||!profile?.email) {
      toast({ title: "Not logged in", description: "Please log in to continue", variant: "destructive" });
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
        email: profile.email,
        callbackPath: "/v3/app/paid",
      });
      onSuccess?.();
      onOpenChange(false);
      window.location.href = res.data.authorization_url;
    } catch (err: any) {
      setSubmitting(false);
      toast({
        title: "Could not start payment",
        description: err.message || "Please try again",
        variant: "destructive",
      });
    }
  };

  const inputCls =
    "w-full rounded-xl border border-ink/12 bg-paper px-4 py-3 text-sm text-ink placeholder:text-ink/35 focus:outline-none focus:border-print-red/40 focus:ring-4 focus:ring-print-red/10 transition-all";

  if (!profile?._id) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 bg-ink/45 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl my-auto rounded-2xl bg-paper border border-ink/12 shadow-[0_30px_80px_-20px_hsl(var(--ink)/0.25)] overflow-hidden"
          >
            <header className="px-6 py-5 flex items-start justify-between gap-3 bg-gradient-to-br from-print-red to-print-orange text-paper">
              <div>
                <p className="inline-flex items-center gap-1.5 rounded-full bg-paper/15 border border-paper/25 px-2.5 py-0.5 text-xs uppercase tracking-wider font-medium">
                  <ShoppingBag className="h-3 w-3" /> {standalone? "Direct payment" : "Checkout"}
                </p>
                <h2 className="font-v3-display mt-2 text-2xl md:text-3xl tracking-tight">
                  {standalone? "Pay for service" : "Confirm your cart"}
                </h2>
                <p className="text-sm text-paper/80 mt-1">
                  {totalUnits} unit{totalUnits === 1? "" : "s"} · ₦{total.toLocaleString()}
                </p>
                <p className="text-xs text-paper/70 mt-1">
                  Paying as {profile.name || profile.email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="h-9 w-9 rounded-full bg-paper/15 hover:bg-paper/25 border border-paper/25 flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
              <div>
                <p className="text-xs uppercase tracking-wider font-medium text-ink/55 mb-3">
                  Per-item booking
                </p>

                {items.length === 0? (
                  <div className="rounded-2xl border border-dashed border-ink/15 px-4 py-10 text-center">
                    <ShoppingBag className="h-8 w-8 text-ink/25 mx-auto mb-2" />
                    <p className="text-sm text-ink/55">Your cart is empty</p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {items.map((item, idx) => {
                      const q = getQty(item._id, item.qty);
                      return (
                        <V3CheckoutItemCard
                          key={item._id}
                          item={item}
                          idx={idx}
                          qty={q}
                          perItemData={perItem[item._id]}
                          onUpdateQty={updateQty}
                          onUpdateItem={updateItem}
                          onRemove={!standalone? async (id) => {
                              try {
                                  await cartApi.removeFromCart(id);
                                  mutate('customer/cart');
                              } catch (e) {
                                  toast({ title: "Failed", description: "Could not remove", variant: "destructive" });
                              }
                          } : undefined}
                          inputCls={inputCls}
                        />
                      );
                    })}
                  </ul>
                )}
              </div>

              <div className="pt-4 border-t border-ink/6 space-y-3">
                <p className="text-xs uppercase tracking-wider font-medium text-ink/55">
                  Voucher Code
                </p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/35" />
                    <input
                      type="text"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                      placeholder="VCH-XXXXXXXX"
                      className={cn(inputCls, "pl-10 uppercase")}
                      disabled={!!appliedVoucher || voucherLoading}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyVoucher}
                    disabled={voucherLoading ||!!appliedVoucher ||!voucherCode}
                    className="px-4 h-[46px] rounded-xl bg-ink text-paper text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-ink/90 transition-colors"
                  >
                    {voucherLoading? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                  </button>
                </div>

                {appliedVoucher && (
                  <div className="flex items-center justify-between text-sm bg-green-50 text-green-700 px-3 py-2 rounded-xl border border-green-200">
                    <span className="font-medium">{appliedVoucher.code}</span>
                    <div className="flex items-center gap-2">
                      <span>-₦{appliedVoucher.discount.toLocaleString()}</span>
                      <button
                        type="button"
                        onClick={() => setAppliedVoucher(null)}
                        className="text-green-700/70 hover:text-green-700"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-ink/6 space-y-2">
                <div className="flex justify-between text-sm text-ink/70">
                  <span>Subtotal</span>
                  <span>₦{subtotal.toLocaleString()}</span>
                </div>
                {appliedVoucher && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Voucher Discount</span>
                    <span>-₦{appliedVoucher.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex items-center justify-between gap-3 pt-2">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-ink/45 font-medium">
                      Total due
                    </p>
                    <p className="font-v3-display text-2xl text-ink">
                      ₦{total.toLocaleString()}
                    </p>
                  </div>
                  <V3Button
                    type="submit"
                    disabled={submitting || items.length === 0}
                    isLoading={submitting}
                    className={cn("min-w-48")}
                  >
                    <CreditCard className="h-4 w-4" />
                    Pay with Paystack
                  </V3Button>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const V3CheckoutItemCard = ({
  item,
  idx,
  qty,
  perItemData,
  onUpdateQty,
  onUpdateItem,
  onRemove,
  inputCls,
}: {
  item: V3CheckoutItem;
  idx: number;
  qty: number;
  perItemData?: PerItem;
  onUpdateQty: (id: string, qty: number) => void;
  onUpdateItem: (id: string, patch: Partial<PerItem>) => void;
  onRemove?: (id: string) => void;
  inputCls: string;
}) => {
  const [imageError, setImageError] = useState(false);
  const vendorName = (item as any)?.vendorBusinessId?.businessName || "Unknown Vendor";

  // Get tomorrow's date in YYYY-MM-DD format for min attribute
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <li className="rounded-2xl border border-ink/12 bg-ink/[0.02] overflow-hidden">
      <div className="px-4 py-3 flex items-center gap-3 bg-paper border-b border-ink/6">
        <img
          src={imageError? "/placeholder.svg" : item.image}
          alt=""
          className="h-14 w-14 object-cover rounded-xl border border-ink/12 shrink-0"
          onError={() => setImageError(true)}
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-wider text-ink/45 font-medium">
            Item · {String(idx + 1).padStart(2, "0")}
          </p>
          <h3 className="font-v3-display text-lg text-ink truncate">
            {item.name}
            <span className="text-ink/55 text-sm font-normal">
              {" "}· {vendorName}
            </span>
          </h3>
        </div>
        <span className="shrink-0 text-xs font-medium text-print-red rounded-full bg-print-red/10 border border-print-red/20 px-2.5 py-1">
          ₦{(item.priceNaira * qty).toLocaleString()}
        </span>
        {onRemove && (
          <button
            type="button"
            onClick={() => onRemove(item._id)}
            className="h-8 w-8 rounded-full hover:bg-red-50 text-red-500/70 hover:text-red-500 flex items-center justify-center transition-colors shrink-0"
            aria-label="Remove item"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4">
        <Field label="Quantity">
          <div className="inline-flex items-center border border-ink/12 rounded-full w-full">
            <button
              type="button"
              onClick={() => onUpdateQty(item._id, qty - 1)}
              className="h-10 w-10 flex items-center justify-center hover:bg-ink/[0.04] transition-colors shrink-0 rounded-l-full"
              aria-label="Decrease"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="flex-1 text-center text-sm text-ink">
              {qty}
            </span>
            <button
              type="button"
              onClick={() => onUpdateQty(item._id, qty + 1)}
              className="h-10 w-10 flex items-center justify-center hover:bg-ink/[0.04] transition-colors shrink-0 rounded-r-full"
              aria-label="Increase"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </Field>
        <Field label="Branch" icon={<MapPin className="h-3.5 w-3.5" />}>
          <select
            required
            value={perItemData?.location?? ""}
            onChange={(e) =>
              onUpdateItem(item._id, { location: e.target.value })
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
        <Field
          label="Preferred date"
          icon={<Calendar className="h-3.5 w-3.5" />}
        >
          <input
            type="date"
            required
            min={minDate}
            value={perItemData?.date?? ""}
            onChange={(e) =>
              onUpdateItem(item._id, { date: e.target.value })
            }
            className={inputCls}
          />
          <p className="text-xs text-ink/40 mt-1">Must be a future date</p>
        </Field>
      </div>
    </li>
  );
};

const Field = ({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <label className="block">
    <span className="flex items-center gap-1.5 text-xs uppercase tracking-wider font-medium text-ink/55 mb-1.5">
      {icon}
      {label}
    </span>
    {children}
  </label>
);
