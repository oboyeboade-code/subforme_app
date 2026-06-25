import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Check, Copy, AlertTriangle, Coins, Ticket, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { coinApi, voucherApi, type Voucher, type CoinBalanceData } from "@/lib/api";
import useSWR, { mutate } from "swr";

const toneMap: Record<string, string> = {
  red: "bg-print-red text-white",
  orange: "bg-print-orange text-black",
  green: "bg-print-green text-black",
};

type Status = "idle" | "verifying" | "success" | "insufficient" | "error";

const Voucher = () => {
  const { data: coinsData } = useSWR<CoinBalanceData>(
    "/coins/balance",
    () => coinApi.getBalance().then(res => res.data)
  );
  const [status, setStatus] = useState<Status>("idle");
  const [activeVoucher, setActiveVoucher] = useState<Voucher | null>(null);
  const [purchasedCode, setPurchasedCode] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState<"market" | "my-vouchers">("market");

  const { data: marketData, isLoading: loadingMarket } = useSWR("market-vouchers", () => 
    voucherApi.getMarketVouchers().then(res => res.data.vouchers)
  );

  const { data: myVouchersData, isLoading: loadingMyVouchers } = useSWR("my-vouchers", () => 
    voucherApi.listMyVouchers().then(res => res.data.vouchers)
  );

  const startPurchase = async (v: Voucher) => {
    setActiveVoucher(v);
    setCopied(false);
    const price = v.priceInCoins || 0;
    if (coinsData?.balance ?? 0 < price) {
      setStatus("insufficient");
      return;
    }
    setStatus("verifying");
    try {
      const res = await voucherApi.buyWithCoins(v.valueNaira);
      if (res.status === "success") {
        setPurchasedCode(res.data.voucher.code);
        setStatus("success");
        mutate("/coin/balance");
        mutate("my-vouchers");
        toast.success("Voucher purchased successfully!");
      } else {
        setStatus("error");
        toast.error("Purchase failed.");
      }
    } catch (error) {
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

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(purchasedCode);
      setCopied(true);
      toast.success("Code copied");
    } catch {
      toast.error("Could not copy.");
    }
  };

  const open = status !== "idle";

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 font-editorial">
      <header className="mb-12 pb-4 border-b-2 border-ink flex items-baseline justify-between">
        <div>
          <p className="font-mono-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2">
            Platform Module · 002
          </p>
          <h1 className="text-5xl text-ink lowercase tracking-tight">
            {view === "market" ? "voucher marketplace" : "your collection"}
          </h1>
        </div>
        <div className="flex gap-8 items-center font-mono-display text-[10px] uppercase tracking-[0.2em]">
          <button 
            onClick={() => setView("market")}
            className={`pb-1 border-b-2 transition-colors ${view === "market" ? "border-ink text-ink" : "border-transparent text-muted-foreground hover:text-ink"}`}
          >
            Market
          </button>
          <button 
            onClick={() => setView("my-vouchers")}
            className={`pb-1 border-b-2 transition-colors ${view === "my-vouchers" ? "border-ink text-ink" : "border-transparent text-muted-foreground hover:text-ink"}`}
          >
            Collection
          </button>
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16"
      >
        <div className="border-2 border-ink bg-ink text-paper p-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="h-16 w-16 border-2 border-paper flex items-center justify-center bg-print-red">
              <Coins className="h-8 w-8 text-paper" />
            </span>
            <div>
              <p className="font-mono-display text-[10px] uppercase tracking-[0.3em] text-paper/50">
                Wallet Balance
              </p>
              <p className="text-6xl mt-1 leading-none tracking-tighter">
                {coinsData?.balance.toLocaleString()}
                <span className="text-xl text-paper/40 ml-3 italic lowercase">coins</span>
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {loadingMarket ? (
              <div className="col-span-full py-32 text-center font-mono-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                Retrieving marketplace data...
              </div>
            ) : marketData?.length === 0 ? (
              <div className="col-span-full py-32 text-center font-mono-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground border-2 border-dashed border-ink/10">
                Market currently empty.
              </div>
            ) : (
              marketData?.map((v, i) => {
                const price = v.priceInCoins || 0;
                const canAfford = coinsData?.balance ?? 0 >= price;
                const tone = (v as any).tone || (i % 3 === 0 ? "red" : i % 3 === 1 ? "orange" : "green");
                
                return (
                  <motion.div
                    key={v._id || i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    whileHover={{ y: -8 }}
                  >
                    <article className="border-2 border-ink bg-card flex flex-col h-full transition-transform">
                      <div className={`${toneMap[tone]} px-6 py-4 border-b-2 border-ink flex items-center justify-between`}>
                        <span className="font-mono-display text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
                          <ShoppingBag className="h-3 w-3" />
                          Market Item
                        </span>
                        <span className="italic text-lg tracking-tight lowercase">₦{v.valueNaira.toLocaleString()} value</span>
                      </div>
                      <div className="p-8 flex-1 flex flex-col">
                        <h3 className="text-3xl text-ink mb-6 lowercase leading-tight">{(v as any).title || `${v.valueNaira} naira voucher`}</h3>
                        <div className="mt-auto">
                          <p className="font-mono-display text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-1">
                            Exchange Rate
                          </p>
                          <p className="text-5xl text-ink mb-8 tracking-tighter">
                            {price.toLocaleString()}{" "}
                            <span className="text-lg text-muted-foreground italic lowercase">coins</span>
                          </p>
                          <button
                            onClick={() => startPurchase(v)}
                            className={`w-full border-2 border-ink py-4 font-mono-display text-[10px] uppercase tracking-[0.3em] transition-all ${
                              canAfford
                               ? `${toneMap[tone]} hover:invert`
                                : "bg-paper-deep text-ink/30 cursor-not-allowed"
                            }`}
                          >
                            {canAfford ? "Purchase Voucher" : "Insufficient Funds"}
                          </button>
                        </div>
                      </div>
                    </article>
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {loadingMyVouchers ? (
              <div className="col-span-full py-32 text-center font-mono-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                Syncing collection...
              </div>
            ) : myVouchersData?.length === 0 ? (
              <div className="col-span-full py-32 text-center border-2 border-dashed border-ink/10 flex flex-col items-center gap-6">
                <Ticket className="h-12 w-12 text-muted-foreground/20" />
                <p className="font-mono-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  Your collection is currently void.
                </p>
                <button 
                  onClick={() => setView("market")}
                  className="font-mono-display text-[10px] uppercase tracking-[0.3em] px-6 py-3 border-2 border-ink hover:bg-ink hover:text-paper transition-colors"
                >
                  Acquire Vouchers
                </button>
              </div>
            ) : (
              myVouchersData?.map((v, i) => (
                <motion.div
                  key={v._id || i}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                >
                  <article className={`border-2 border-ink bg-card flex flex-col h-full relative overflow-hidden ${v.status === 'used' ? 'opacity-40 grayscale' : ''}`}>
                    {v.status === 'used' && (
                      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                        <span className="border-4 border-print-red text-print-red font-mono-display text-5xl uppercase tracking-[0.4em] px-6 py-3 -rotate-12 opacity-90">
                          REDEEMED
                        </span>
                      </div>
                    )}
                    <div className="bg-paper-deep px-6 py-4 border-b-2 border-ink flex items-center justify-between">
                      <span className="font-mono-display text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
                        {v.status === 'active' ? 'Status: Active' : 'Status: Redeemed'}
                      </span>
                      <Ticket className="h-4 w-4 text-ink" />
                    </div>
                    <div className="p-8 flex-1 flex flex-col">
                      <p className="font-mono-display text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-1">
                        Voucher Denomination
                      </p>
                      <h3 className="text-5xl text-ink mb-8 tracking-tighter lowercase">₦{v.valueNaira.toLocaleString()}</h3>
                      
                      <div className="mt-auto space-y-4">
                        <div className="bg-paper-deep border-2 border-ink p-4 flex items-center justify-between">
                          <code className="font-mono text-sm tracking-[0.2em] uppercase">{v.code}</code>
                          {v.status === 'active' && (
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(v.code);
                                toast.success("Copied");
                              }}
                              className="p-2 hover:bg-ink hover:text-paper transition-colors"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        <p className="font-mono-display text-[8px] uppercase tracking-[0.3em] text-muted-foreground leading-relaxed">
                          Issued: {new Date(v.issuedAt).toLocaleDateString()}
                          {v.expiresAt && ` · Expiry: ${new Date(v.expiresAt).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                  </article>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={open} onOpenChange={(v) => { if (!v) close(); }}>
        <DialogContent className="bg-card border-2 border-ink rounded-none w-[calc(100%-1.5rem)] sm:w-full max-w-md p-0 overflow-hidden font-editorial max-h-[calc(100dvh-2rem)] flex flex-col">
          <div className="bg-ink text-paper p-6 border-b-2 border-ink">
            <DialogTitle className="text-2xl lowercase tracking-tight">
              {status === "verifying" && "Authorizing transaction..."}
              {status === "success" && "Voucher acquired"}
              {status === "insufficient" && "Insufficient funds"}
              {status === "error" && "System error"}
            </DialogTitle>
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">
              {status === "verifying" && (
                <motion.div
                  key="verifying"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-12 flex flex-col items-center gap-8"
                >
                  <div className="relative">
                    <div className="h-20 w-20 border-2 border-ink/10 border-t-print-red rounded-full animate-spin" />
                    <Coins className="h-8 w-8 text-ink absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <div className="text-center">
                    <p className="font-mono-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                      Processing Ledger Entry
                    </p>
                    <p className="text-2xl text-ink mt-2 lowercase">
                      Deducting {activeVoucher?.priceInCoins?.toLocaleString()} coins
                    </p>
                  </div>
                </motion.div>
              )}

              {status === "success" && activeVoucher && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div className="flex items-center gap-6 border-2 border-ink bg-print-green/10 p-6">
                    <div className="h-12 w-12 bg-print-green flex items-center justify-center border-2 border-ink">
                      <Check className="h-6 w-6 text-black" />
                    </div>
                    <div>
                      <p className="text-2xl text-ink lowercase tracking-tight">₦{activeVoucher.valueNaira.toLocaleString()} voucher issued</p>
                      <p className="font-mono-display text-[9px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
                        Exchange confirmed · {activeVoucher.priceInCoins?.toLocaleString()} coins
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="font-mono-display text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-3">
                      Unique Identification Code
                    </p>
                    <div className="flex items-stretch border-2 border-ink">
                      <code className="flex-1 px-6 py-5 font-mono text-xl tracking-[0.25em] text-ink bg-paper-deep font-bold uppercase">
                        {purchasedCode}
                      </code>
                      <button
                        onClick={copy}
                        className="border-l-2 border-ink px-6 bg-ink text-paper hover:bg-print-red transition-colors flex flex-col items-center justify-center gap-1 font-mono-display text-[9px] uppercase"
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {copied ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <p className="font-mono-display text-[9px] uppercase tracking-[0.2em] text-muted-foreground mt-4 italic text-center">
                      The code has been added to your collection.
                    </p>
                  </div>

                  <button
                    onClick={close}
                    className="w-full border-2 border-ink bg-ink text-paper py-5 font-mono-display text-[10px] uppercase tracking-[0.3em] hover:bg-print-red transition-colors"
                  >
                    Close & View Collection
                  </button>
                </motion.div>
              )}

              {status === "insufficient" && activeVoucher && (
                <motion.div
                  key="insufficient"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-8"
                >
                  <div className="flex items-center gap-6 border-2 border-ink bg-print-red/10 p-6">
                    <div className="h-12 w-12 bg-print-red flex items-center justify-center border-2 border-ink">
                      <AlertTriangle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl text-ink lowercase tracking-tight">Insufficient coin balance</p>
                      <p className="font-mono-display text-[9px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
                        Deficit: {( (activeVoucher.priceInCoins || 0) - Number(coinsData?.balance)).toLocaleString()} coins
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 border-2 border-ink p-6 bg-paper-deep">
                    <div className="flex justify-between font-mono-display text-[9px] uppercase tracking-[0.3em]">
                      <span className="text-muted-foreground">Current Assets</span>
                      <span className="text-ink font-bold">{coinsData?.balance.toLocaleString()} coins</span>
                    </div>
                    <div className="flex justify-between font-mono-display text-[9px] uppercase tracking-[0.3em]">
                      <span className="text-muted-foreground">Voucher Cost</span>
                      <span className="text-ink font-bold">{activeVoucher.priceInCoins?.toLocaleString()} coins</span>
                    </div>
                  </div>

                  <button
                    onClick={close}
                    className="w-full border-2 border-ink py-5 font-mono-display text-[10px] uppercase tracking-[0.3em] hover:bg-ink hover:text-paper transition-colors"
                  >
                    Return to Market
                  </button>
                </motion.div>
              )}

              {status === "error" && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-8 text-center py-6"
                >
                  <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-print-red/10 text-print-red mb-4">
                    <AlertTriangle className="h-10 w-10" />
                  </div>
                  <h3 className="text-3xl lowercase">Transaction failed</h3>
                  <p className="font-mono-display text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
                    The ledger could not be updated. No assets were deducted.
                  </p>
                  <button
                    onClick={close}
                    className="w-full border-2 border-ink py-5 font-mono-display text-[10px] uppercase tracking-[0.3em] hover:bg-ink hover:text-paper transition-colors"
                  >
                    Dismiss
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Voucher;
