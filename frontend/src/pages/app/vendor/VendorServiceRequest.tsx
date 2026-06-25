import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  Tag,
  Phone,
  Globe,
  MapPin,
  Wallet,
  CheckCircle2,
  ArrowRight,
  Receipt,
  ClipboardList,
} from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ALL_OFFER_CATEGORIES } from "@/lib/page/data";

type PayoutMethod = "bank" | "mobile" | "wallet";

const labelClass = "font-mono-display text-xs uppercase tracking-[0.2em]";
const inputClass =
  "h-12 rounded-none border-2 border-ink bg-paper font-mono-display text-base focus-visible:ring-print-green";
const textareaClass =
  "min-h-[110px] rounded-none border-2 border-ink bg-paper font-mono-display text-sm focus-visible:ring-print-green";

const VendorServiceRequest = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [business, setBusiness] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");

  const [serviceName, setServiceName] = useState("");
  const [category, setCategory] = useState<string>("");
  const [pricing, setPricing] = useState("");
  const [estCodes, setEstCodes] = useState("");
  const [hours, setHours] = useState("");
  const [description, setDescription] = useState("");
  const [redemption, setRedemption] = useState("");

  const [payoutMethod, setPayoutMethod] = useState<PayoutMethod>("bank");
  const [payoutName, setPayoutName] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [mobileWallet, setMobileWallet] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [terms, setTerms] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const required = [business, contactName, email, serviceName, category, pricing, description, payoutName];
    if (required.some((v) => !v)) {
      toast({
        title: "Missing required details",
        description: "Fill in business, contact, service and payout fields to continue.",
        variant: "destructive",
      });
      return;
    }
    if (!terms) {
      toast({ title: "Confirm the terms", description: "Tick the box to agree to the listing terms.", variant: "destructive" });
      return;
    }
    if (payoutMethod === "bank" && (!bankName || !accountNumber)) {
      toast({ title: "Bank details needed", variant: "destructive" });
      return;
    }
    if (payoutMethod === "mobile" && !mobileWallet) {
      toast({ title: "Mobile money number needed", variant: "destructive" });
      return;
    }
    if (payoutMethod === "wallet" && !walletAddress) {
      toast({ title: "Wallet address needed", variant: "destructive" });
      return;
    }
    setSubmitted(true);
    toast({ title: "Request submitted", description: "Admin will review and get back within 2 business days." });
  };

  if (submitted) {
    return (
      <AuthShell
        edition="Vol. I · Vendor Desk"
        eyebrow="Listing requested"
        title="Filed with the editor."
        lede="Our admin team reviews new listings within 2 business days. You'll receive an email at the address you provided once a decision is made."
        accentClass="text-print-green"
        ruleClass="bg-print-green"
      >
        <div className="border-2 border-print-green/60 bg-print-green/5 p-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-6 w-6 text-print-green" />
            <div>
              <p className="font-editorial text-2xl">Request received.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                We've logged "<span className="font-mono-display text-ink">{serviceName}</span>" under{" "}
                <span className="font-mono-display text-ink">{category}</span> for{" "}
                <span className="font-mono-display text-ink">{business}</span>.
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                Confirmation will be sent to{" "}
                <span className="font-mono-display text-ink">{email}</span>.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={() => navigate("/vendor/dashboard")}
                  className="h-11 rounded-none bg-ink font-mono-display text-xs uppercase tracking-[0.2em] text-paper hover:bg-ink/90"
                >
                  Back to vendor dashboard
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSubmitted(false);
                    setServiceName("");
                    setDescription("");
                    setCategory("");
                  }}
                  className="h-11 rounded-none border-2 border-ink font-mono-display text-xs uppercase tracking-[0.2em]"
                >
                  Submit another
                </Button>
              </div>
            </div>
          </div>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      edition="Vol. I · Vendor Desk"
      eyebrow="Request a listing"
      title="Put your service on the offer page."
      lede="Tell us about the service you'd like to offer through Subforme: what it is, how customers redeem it, and where the payouts should land. Submissions are reviewed by admin before going live."
      accentClass="text-print-green"
      ruleClass="bg-print-green"
      aside={
        <div className="space-y-5">
          <div className="border-l-2 border-print-green/40 pl-4">
            <p className="font-mono-display text-[11px] uppercase tracking-[0.25em] text-print-green">
              How it works
            </p>
            <ol className="mt-2 space-y-2 text-sm leading-relaxed text-ink/80">
              <li>1. Submit this form with your service & payout details.</li>
              <li>2. Admin reviews within 2 business days.</li>
              <li>3. Approved listings appear on the Offers page; vendor login is provisioned.</li>
              <li>4. Payouts settle weekly to the method you choose below.</li>
            </ol>
          </div>
          <div className="border-l-2 border-ink/20 pl-4">
            <p className="font-mono-display text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              Already a vendor?
            </p>
            <Link
              to="/vendor-login"
              className="mt-1 block text-sm font-medium text-ink underline-offset-4 hover:underline"
            >
              Sign in to the vendor desk →
            </Link>
          </div>
        </div>
      }
    >
      <div className="flex items-center gap-2">
        <ClipboardList className="h-4 w-4 text-print-green" />
        <p className="font-mono-display text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
          Section B · Vendor · New listing request
        </p>
      </div>
      <h2 className="font-editorial mt-2 text-2xl">Service listing request</h2>

      <form onSubmit={onSubmit} className="mt-8 space-y-10">
        {/* ── Section: Business ──────────────────────── */}
        <fieldset className="space-y-5">
          <legend className="font-editorial text-lg flex items-center gap-2">
            <Building2 className="h-4 w-4 text-print-green" /> Business details
          </legend>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="business" className={labelClass}>Business name *</Label>
              <Input id="business" value={business} onChange={(e) => setBusiness(e.target.value)} placeholder="Café Lumière" className={inputClass} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact" className={labelClass}>Contact person *</Label>
              <Input id="contact" value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Ada Okafor" className={inputClass} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className={labelClass}>Email *</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="hello@yourshop.com" className={inputClass} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className={labelClass}>Phone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234 800 000 0000" className={inputClass} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="website" className={labelClass}>
                <span className="inline-flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" /> Website / social</span>
              </Label>
              <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://yourbusiness.com" className={inputClass} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address" className={labelClass}>
                <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Business address</span>
              </Label>
              <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="12 Awolowo Rd, Ikoyi" className={inputClass} />
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-5 border-t-2 border-ink/10 pt-8">
          <legend className="font-editorial text-lg flex items-center gap-2">
            <Tag className="h-4 w-4 text-print-green" /> Service details
          </legend>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="service" className={labelClass}>Service name *</Label>
              <Input id="service" value={serviceName} onChange={(e) => setServiceName(e.target.value)} placeholder="Saturday Brunch Bundle" className={inputClass} />
            </div>

            <div className="space-y-2">
              <Label className={labelClass}>Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className={`${inputClass} justify-between`}>
                  <SelectValue placeholder="Pick a category" />
                </SelectTrigger>
                <SelectContent>
                  {ALL_OFFER_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pricing" className={labelClass}>Pricing per code *</Label>
              <Input id="pricing" value={pricing} onChange={(e) => setPricing(e.target.value)} placeholder="₦5,000 / code" className={inputClass} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estCodes" className={labelClass}>Est. codes per month</Label>
              <Input id="estCodes" inputMode="numeric" value={estCodes} onChange={(e) => setEstCodes(e.target.value)} placeholder="200" className={inputClass} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hours" className={labelClass}>Operating hours</Label>
              <Input id="hours" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="Mon–Sat · 09:00–21:00" className={inputClass} />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description" className={labelClass}>Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does the customer get when they redeem one code? Be specific."
                className={textareaClass}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="redemption" className={labelClass}>Redemption instructions</Label>
              <Textarea
                id="redemption"
                value={redemption}
                onChange={(e) => setRedemption(e.target.value)}
                placeholder="How do customers present a code at your counter? Any time limits or blackout dates?"
                className={textareaClass}
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-5 border-t-2 border-ink/10 pt-8">
          <legend className="font-editorial text-lg flex items-center gap-2">
            <Wallet className="h-4 w-4 text-print-green" /> Payout details
          </legend>

          <div className="space-y-2">
            <Label className={labelClass}>Where should payouts go? *</Label>
            <div className="grid gap-2 sm:grid-cols-3">
              {([
                { id: "bank" as PayoutMethod, label: "Bank account" },
                { id: "mobile" as PayoutMethod, label: "Mobile money" },
                { id: "wallet" as PayoutMethod, label: "Crypto wallet" },
              ]).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPayoutMethod(opt.id)}
                  className={`h-12 border-2 border-ink font-mono-display text-xs uppercase tracking-[0.2em] transition-colors ${
                    payoutMethod === opt.id ? "bg-print-green text-paper" : "bg-paper text-ink hover:bg-ink/5"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payoutName" className={labelClass}>Account / payee name *</Label>
            <Input id="payoutName" value={payoutName} onChange={(e) => setPayoutName(e.target.value)} placeholder="As it appears on the account" className={inputClass} />
          </div>

          {payoutMethod === "bank" && (
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bankName" className={labelClass}>Bank name *</Label>
                <Input id="bankName" value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="GTBank" className={inputClass} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber" className={labelClass}>Account number *</Label>
                <Input id="accountNumber" inputMode="numeric" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="0123456789" className={inputClass} />
              </div>
            </div>
          )}

          {payoutMethod === "mobile" && (
            <div className="space-y-2">
              <Label htmlFor="mobileWallet" className={labelClass}>
                <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> Mobile money number *</span>
              </Label>
              <Input id="mobileWallet" value={mobileWallet} onChange={(e) => setMobileWallet(e.target.value)} placeholder="+233 24 000 0000" className={inputClass} />
            </div>
          )}

          {payoutMethod === "wallet" && (
            <div className="space-y-2">
              <Label htmlFor="walletAddress" className={labelClass}>Wallet address (USDC · TRC-20) *</Label>
              <Input id="walletAddress" value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)} placeholder="T..." className={`${inputClass} font-mono`} />
            </div>
          )}
        </fieldset>

        <fieldset className="space-y-3 border-t-2 border-ink/10 pt-8">
          <label className="flex items-start gap-3 text-sm leading-relaxed">
            <input
              type="checkbox"
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
              className="mt-1 h-4 w-4 accent-print-green"
            />
            <span className="text-ink/80">
              I confirm the details above are accurate, and I agree to honour single-use codes issued through Subforme. I understand that listings are subject to admin approval and that payouts settle on a weekly cycle, less the platform fee.
            </span>
          </label>
        </fieldset>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="submit"
            className="h-12 flex-1 rounded-none bg-print-green font-mono-display text-sm uppercase tracking-[0.2em] text-secondary-foreground hover:bg-print-green/90"
          >
            <Receipt className="mr-2 h-4 w-4" /> Submit listing request <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Link
            to="/vendor/dashboard"
            className="font-mono-display text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-ink"
          >
            Cancel
          </Link>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link to="/register" className="font-medium text-ink underline-offset-4 hover:underline">
            Customer registration is over here →
          </Link>
        </p>
      </form>
    </AuthShell>
  );
};

export default VendorServiceRequest;
