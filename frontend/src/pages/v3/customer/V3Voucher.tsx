import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, Copy, AlertTriangle, Coins, Ticket, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { V3Card, V3Button, V3Pill, V3SectionHeader } from "@/components/v3/V3UI";
import { coinApi, voucherApi, type Voucher, type CoinBalanceData } from "@/lib/api";
import useSWR, { mutate } from "swr";

type Status = "idle" | "verifying" | "success" | "insufficient" | "error";

// Cycling gradient hues for the v3 card headers
const HUES = [
  "from-print-orange to-print-red",
  "from-print-red to-print-orange",
  "from-print-green to-print-orange",
];

const V3Voucher = () => {
  const { data: coinsData } = useSWR<CoinBalanceData>(
    "/coins/balance",
    () => coinApi.getBalance().then((res) => res.data),
  );

  const { data: marketData, isLoading: loadingMarket } = useSWR(
    "market-vouchers",
    () => voucherApi.getMarketVouchers().then((res) => res.data.vouchers),
  );

  const { data: myVouchersData, isLoading: loadingMyVouchers } = useSWR(
    "my-vouchers",
    () => voucherApi.listMyVouchers().then((res) => res.data.vouchers),
  );

  const [status, setStatus] = useState<Status>("idle");
  const [activeVoucher, setActiveVoucher] = useState<Voucher | null>(null);
  const [purchasedCode, setPurchasedCode] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState<"market" | "my-vouchers">("market");

  const balance = coinsData?.balance ?? 0;

  const startPurchase = async (v: Voucher) => {
    setActiveVoucher(v);
    setCopied(false);
    const price = v.priceInCoins || 0;
    if (balance < price) {
      setStatus("insufficient");
      return;
    }
    setStatus("verifying");
    try {
      const res = await voucherApi.buyWithCoins(v.valueNaira);
      if (res.status === "success") {
        setPurchasedCode(res.data.voucher.code);
        setStatus("success");
        mutate("/coins/balance");
        mutate("my-vouchers");
        toast.success("Voucher purchased successfully!");
      } else {
        setStatus("error");
        toast.error("Purchase failed.");
      }
    } catch {
      setStatus("error");
      toast.error("An error occurred.");
    }
  };

  const close = () => {
    setStatus("idle");
    setActiveVoucher(null);
    setPurchasedCode("");
    setCopied(false);
  };

  const copy = async (text?: string) => {
    try {
      await navigator.clipboard.writeText(text ?? purchasedCode);
      setCopied(true);
      toast.success("Code copied to clipboard");
    } catch {
      toast.error("Could not copy.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-8 py-10 md:py-14">
      <V3SectionHeader
        eyebrow="Buy Voucher"
        title={view === "market" ? "Cash in your coins" : "Your voucher collection"}
        meta={`Balance · ${balance.toLocaleString()} coins`}
      />

      {/* View switcher */}
      <div className="flex gap-2 mb-6">
        <V3Pill
          tone={view === "market" ? "ink" : undefined}
          className="cursor-pointer"
          onClick={() => setView("market")}
        >
          <ShoppingBag className="h-3.5 w-3.5 mr-1.5 inline" />
          Market
        </V3Pill>
        <V3Pill
          tone={view === "my-vouchers" ? "ink" : undefined}
          className="cursor-pointer"
          onClick={() => setView("my-vouchers")}
        >
          <Ticket className="h-3.5 w-3.5 mr-1.5 inline" />
          My Vouchers
        </V3Pill>
      </div>

      {/* Wallet banner */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <div className="relative overflow-hidden rounded-[20px] p-7 text-paper bg-ink flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="h-14 w-14 rounded-2xl bg-gradient-to-br from-print-orange to-print-red flex items-center justify-center">
              <Coins className="h-6 w-6 text-paper" />
            </span>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-paper/55">Wallet balance</p>
              <p className="font-v3-display text-4xl md:text-5xl mt-1 leading-none">
                {balance.toLocaleString()}
                <span className="text-base text-paper/55 ml-2">coins</span>
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {view === "market" ? (
          <motion.div
            key="market"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {loadingMarket ? (
              <div className="col-span-full py-20 text-center text-sm text-ink/55">
                Loading marketplace…
              </div>
            ) : !marketData || marketData.length === 0 ? (
              <div className="col-span-full py-20 text-center text-sm text-ink/55 rounded-2xl border border-dashed border-ink/15">
                Market is currently empty.
              </div>
            ) : (
              marketData.map((v, i) => {
                const price = v.priceInCoins || 0;
                const canAfford = balance >= price;
                const hue = HUES[i % HUES.length];
                const title = (v as { title?: string }).title || `₦${v.valueNaira.toLocaleString()} voucher`;
                return (
                  <motion.div
                    key={v._id || i}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.07 }}
                    whileHover={{ y: -5 }}
                  >
                    <V3Card className="p-0 overflow-hidden h-full flex flex-col">
                      <div className={`p-5 text-paper bg-gradient-to-br ${hue} flex items-center justify-between`}>
                        <span className="font-v3-display text-2xl">
                          ₦{v.valueNaira.toLocaleString()}
                        </span>
                        <span className="rounded-full bg-paper/20 border border-paper/25 px-2.5 py-1 text-[11px] font-medium">
                          No. {String(i + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="font-v3-display text-xl mb-5">{title}</h3>
                        <p className="text-[11px] uppercase tracking-wider text-ink/55">Price</p>
                        <p className="font-v3-display text-4xl mt-1 mb-7">
                          {price.toLocaleString()}
                          <span className="text-base text-ink/55 ml-1">coins</span>
                        </p>
                        <V3Button
                          variant={canAfford ? "primary" : "soft"}
                          fullWidth
                          onClick={() => startPurchase(v)}
                          className="mt-auto"
                        >
                          {canAfford ? "Buy Voucher" : "Insufficient — Try"}
                        </V3Button>
                      </div>
                    </V3Card>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        ) : (
          <motion.div
            key="my-vouchers"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {loadingMyVouchers ? (
              <div className="col-span-full py-20 text-center text-sm text-ink/55">
                Loading your collection…
              </div>
            ) : !myVouchersData || myVouchersData.length === 0 ? (
              <div className="col-span-full py-20 rounded-2xl border border-dashed border-ink/15 flex flex-col items-center gap-5">
                <Ticket className="h-10 w-10 text-ink/20" />
                <p className="text-sm text-ink/55">You don't own any vouchers yet.</p>
                <V3Button variant="soft" onClick={() => setView("market")}>
                  Browse Market
                </V3Button>
              </div>
            ) : (
              myVouchersData.map((v, i) => {
                const used = v.status === "used";
                return (
                  <motion.div
                    key={v._id || i}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: i * 0.07 }}
                  >
                    <V3Card className={`p-0 overflow-hidden h-full flex flex-col relative ${used ? "opacity-50" : ""}`}>
                      {used && (
                        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                          <span className="rounded-full border-2 border-print-red text-print-red font-v3-display text-2xl uppercase tracking-widest px-5 py-1.5 -rotate-12 bg-paper/80">
                            Redeemed
                          </span>
                        </div>
                      )}
                      <div className="p-5 flex items-center justify-between bg-ink/[0.03] border-b border-ink/10">
                        <span className="text-[11px] uppercase tracking-wider text-ink/55">
                          {used ? "Used" : "Active"}
                        </span>
                        <Ticket className="h-4 w-4 text-ink/55" />
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <p className="text-[11px] uppercase tracking-wider text-ink/55">Denomination</p>
                        <p className="font-v3-display text-4xl mt-1 mb-5">
                          ₦{v.valueNaira.toLocaleString()}
                        </p>

                        <div className="mt-auto space-y-3">
                          <div className="flex items-stretch rounded-xl border border-ink/15 overflow-hidden">
                            <code className="flex-1 px-3 py-2.5 font-mono text-sm tracking-[0.15em] bg-ink/[0.03] break-all">
                              {v.code}
                            </code>
                            {!used && (
                              <button
                                onClick={() => copy(v.code)}
                                className="px-3 bg-ink text-paper hover:bg-print-red transition-colors flex items-center"
                                aria-label="Copy voucher code"
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                          <p className="text-[11px] text-ink/55">
                            Issued {new Date(v.issuedAt).toLocaleDateString()}
                            {v.expiresAt && ` · Expires ${new Date(v.expiresAt).toLocaleDateString()}`}
                          </p>
                        </div>
                      </div>
                    </V3Card>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={status !== "idle"} onOpenChange={(v) => { if (!v) close(); }}>
        <DialogContent className="bg-paper border border-ink/15 rounded-2xl w-[calc(100%-1.5rem)] sm:w-full max-w-md p-5 sm:p-6 max-h-[calc(100dvh-2rem)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-v3-display text-2xl">
              {status === "verifying" && "Verifying payment…"}
              {status === "success" && "Payment successful"}
              {status === "insufficient" && "Insufficient coins"}
              {status === "error" && "Transaction failed"}
            </DialogTitle>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {status === "verifying" && (
              <motion.div key="v" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-8 flex flex-col items-center gap-4">
                <div className="h-12 w-12 border-2 border-ink/15 border-t-print-red rounded-full animate-spin" />
                <p className="text-xs text-ink/60">
                  Authorising · {activeVoucher?.priceInCoins?.toLocaleString()} coins
                </p>
              </motion.div>
            )}

            {status === "success" && activeVoucher && (
              <motion.div key="s" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 mt-2">
                <div className="rounded-xl border border-print-green/25 bg-print-green/10 p-3 flex items-center gap-3">
                  <Check className="h-5 w-5 text-print-green" strokeWidth={3} />
                  <div>
                    <p className="font-v3-display text-base">
                      ₦{activeVoucher.valueNaira.toLocaleString()} voucher issued
                    </p>
                    <p className="text-[11px] text-ink/60">
                      Charged {activeVoucher.priceInCoins?.toLocaleString()} coins
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-wider text-ink/60 mb-2">Your voucher code</p>
                  <div className="flex items-stretch rounded-xl border border-ink/15 overflow-hidden">
                    <code className="flex-1 px-3 py-3 font-mono text-sm tracking-[0.15em] bg-ink/[0.03] break-all">
                      {purchasedCode}
                    </code>
                    <button
                      onClick={() => copy()}
                      className="px-4 bg-ink text-paper hover:bg-print-red transition-colors flex items-center gap-2 text-xs font-medium"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-ink/12">
                  <span className="text-[11px] uppercase tracking-wider text-ink/60">New balance</span>
                  <span className="font-v3-display text-lg">{balance.toLocaleString()} coins</span>
                </div>

                <V3Button fullWidth onClick={() => { close(); setView("my-vouchers"); }}>
                  View My Vouchers
                </V3Button>
              </motion.div>
            )}

            {status === "insufficient" && activeVoucher && (
              <motion.div key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 mt-2">
                <div className="rounded-xl border border-print-red/25 bg-print-red/10 p-3 flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-print-red" />
                  <div>
                    <p className="font-v3-display text-base">Not enough coins</p>
                    <p className="text-[11px] text-ink/60">
                      Need {((activeVoucher.priceInCoins || 0) - balance).toLocaleString()} more coins.
                    </p>
                  </div>
                </div>
                <div className="space-y-2 rounded-xl border border-ink/15 p-4 bg-ink/[0.02]">
                  <div className="flex justify-between text-[11px] uppercase tracking-wider">
                    <span className="text-ink/60">Current balance</span>
                    <span className="text-ink font-medium">{balance.toLocaleString()} coins</span>
                  </div>
                  <div className="flex justify-between text-[11px] uppercase tracking-wider">
                    <span className="text-ink/60">Voucher cost</span>
                    <span className="text-ink font-medium">{activeVoucher.priceInCoins?.toLocaleString()} coins</span>
                  </div>
                </div>
                <V3Button variant="soft" fullWidth onClick={close}>Close</V3Button>
              </motion.div>
            )}

            {status === "error" && (
              <motion.div key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 mt-2 text-center py-2">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-print-red/10 text-print-red">
                  <AlertTriangle className="h-7 w-7" />
                </div>
                <p className="text-sm text-ink/70">
                  We couldn't complete the purchase. No coins were deducted.
                </p>
                <V3Button variant="soft" fullWidth onClick={close}>Dismiss</V3Button>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default V3Voucher;
