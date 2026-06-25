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
  Mail,
} from "lucide-react";
import V3AuthShell from "@/components/v3/V3AuthShell";
import { V3Input, V3Button } from "@/components/v3/V3UI";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ALL_OFFER_CATEGORIES } from "@/lib/page/data";
import { cn } from "@/lib/utils";

type PayoutMethod = "bank" | "mobile" | "wallet";

const V3VendorServiceRequest = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [business, setBusiness] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");

  const [serviceName, setServiceName] = useState("");
  const [category, setCategory] = useState("");
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
      toast({ title: "Missing required details", description: "Please complete the highlighted sections.", variant: "destructive" });
      return;
    }
    if (!terms) { toast({ title: "Confirm the terms first.", variant: "destructive" }); return; }
    if (payoutMethod === "bank" && (!bankName || !accountNumber)) { toast({ title: "Bank details needed.", variant: "destructive" }); return; }
    if (payoutMethod === "mobile" && !mobileWallet) { toast({ title: "Mobile money number needed.", variant: "destructive" }); return; }
    if (payoutMethod === "wallet" && !walletAddress) { toast({ title: "Wallet address needed.", variant: "destructive" }); return; }
    setSubmitted(true);
    toast({ title: "Request submitted", description: "Admin will review within 2 business days." });
  };

  if (submitted) {
    return (
      <V3AuthShell
        eyebrow="Listing requested"
        title="Filed with the editor."
        lede="Our admin team reviews new listings within 2 business days. You'll receive an email once a decision is made."
        accent="green"
        aside={
          <div>
            <p className="text-[11px] uppercase tracking-wider opacity-80">What happens next</p>
            <p className="mt-2 text-sm text-paper/90">
              Approved listings appear on the Offers page and your vendor login is activated.
            </p>
          </div>
        }
      >
        <div className="rounded-2xl border border-print-green/30 bg-print-green/5 p-6">
          <CheckCircle2 className="h-7 w-7 text-print-green" />
          <p className="mt-3 font-v3-display text-2xl">Request received.</p>
          <p className="mt-1 text-sm text-ink/70">
            We've logged "<span className="font-medium text-ink">{serviceName}</span>" under{" "}
            <span className="font-medium text-ink">{category}</span> for{" "}
            <span className="font-medium text-ink">{business}</span>. Confirmation will go to{" "}
            <span className="font-medium text-ink">{email}</span>.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <V3Button onClick={() => navigate("/v3/vendor/dashboard")}>Back to vendor dashboard</V3Button>
            <V3Button variant="ghost" onClick={() => { setSubmitted(false); setServiceName(""); setCategory(""); setDescription(""); }}>
              Submit another
            </V3Button>
          </div>
        </div>
      </V3AuthShell>
    );
  }

  const inputCls = "w-full rounded-xl border border-ink/12 bg-paper px-4 py-3 text-ink placeholder:text-ink/35 focus:outline-none focus:border-print-green/40 focus:ring-4 focus:ring-print-green/10 transition-all";

  return (
    <V3AuthShell
      eyebrow="Vendor · Request a listing"
      title="Get your service on Offers."
      lede="Tell us about the service, how customers redeem it, and where the payouts should land. Submissions are reviewed by admin before going live."
      accent="green"
      aside={
        <div className="space-y-5">
          <div>
            <p className="text-[11px] uppercase tracking-wider opacity-80">How it works</p>
            <ol className="mt-2 space-y-1.5 text-sm text-paper/90">
              <li>1. Submit this form.</li>
              <li>2. Admin reviews within 2 business days.</li>
              <li>3. We provision your vendor login.</li>
              <li>4. Payouts settle weekly to your chosen method.</li>
            </ol>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider opacity-80">Already a vendor?</p>
            <Link to="/v3/vendor-login" className="mt-1 inline-block text-sm text-paper underline underline-offset-4">
              Sign in to your dashboard →
            </Link>
          </div>
        </div>
      }
    >
      <div className="flex items-center gap-2 text-sm font-medium text-print-green">
        <ClipboardList className="h-4 w-4" /> New listing request
      </div>
      <h2 className="font-v3-display mt-2 text-3xl">Service listing request</h2>
      <p className="mt-2 text-sm text-ink/60">Fields marked * are required.</p>

      <form onSubmit={onSubmit} className="mt-7 space-y-8">
        {/* Business */}
        <section className="space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2 text-ink"><Building2 className="h-4 w-4 text-print-green" /> Business</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <V3Input name="business" label="Business name *" placeholder="Café Lumière" value={business} onChange={(e) => setBusiness(e.target.value)} />
            <V3Input name="contact" label="Contact person *" placeholder="Ada Okafor" value={contactName} onChange={(e) => setContactName(e.target.value)} />
            <V3Input name="email" type="email" label="Email *" placeholder="hello@yourshop.com" icon={<Mail className="h-4 w-4" />} value={email} onChange={(e) => setEmail(e.target.value)} />
            <V3Input name="phone" label="Phone" placeholder="+234 800 000 0000" icon={<Phone className="h-4 w-4" />} value={phone} onChange={(e) => setPhone(e.target.value)} />
            <V3Input name="website" label="Website / social" placeholder="https://" icon={<Globe className="h-4 w-4" />} value={website} onChange={(e) => setWebsite(e.target.value)} />
            <V3Input name="address" label="Business address" placeholder="12 Awolowo Rd, Ikoyi" icon={<MapPin className="h-4 w-4" />} value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
        </section>

        {/* Service */}
        <section className="space-y-4 border-t border-ink/15 pt-7">
          <h3 className="text-sm font-semibold flex items-center gap-2 text-ink"><Tag className="h-4 w-4 text-print-green" /> Service</h3>

          <V3Input name="serviceName" label="Service name *" placeholder="Saturday Brunch Bundle" value={serviceName} onChange={(e) => setServiceName(e.target.value)} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-ink/70 mb-1.5">Category *</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full rounded-xl border border-ink/12 bg-paper px-4 py-3 h-auto text-ink focus:ring-4 focus:ring-print-green/10 focus:border-print-green/40">
                  <SelectValue placeholder="Pick a category" />
                </SelectTrigger>
                <SelectContent>
                  {ALL_OFFER_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <V3Input name="pricing" label="Pricing per code *" placeholder="₦5,000 / code" value={pricing} onChange={(e) => setPricing(e.target.value)} />
            <V3Input name="estCodes" label="Est. codes / month" inputMode="numeric" placeholder="200" value={estCodes} onChange={(e) => setEstCodes(e.target.value)} />
            <V3Input name="hours" label="Operating hours" placeholder="Mon–Sat · 09:00–21:00" value={hours} onChange={(e) => setHours(e.target.value)} />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink/70 mb-1.5">Description *</label>
            <textarea
              className={cn(inputCls, "min-h-[110px]")}
              placeholder="What does the customer get when they redeem one code? Be specific."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink/70 mb-1.5">Redemption instructions</label>
            <textarea
              className={cn(inputCls, "min-h-[100px]")}
              placeholder="How do customers present a code at your counter? Any time limits or blackout dates?"
              value={redemption}
              onChange={(e) => setRedemption(e.target.value)}
            />
          </div>
        </section>

        {/* Payout */}
        <section className="space-y-4 border-t border-ink/15 pt-7">
          <h3 className="text-sm font-semibold flex items-center gap-2 text-ink"><Wallet className="h-4 w-4 text-print-green" /> Payout</h3>

          <div>
            <label className="block text-xs font-medium text-ink/70 mb-1.5">Where should payouts go? *</label>
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
                  className={cn(
                    "rounded-xl border px-4 py-3 text-sm font-medium transition-all",
                    payoutMethod === opt.id
                      ? "border-print-green bg-print-green/10 text-print-green"
                      : "border-ink/12 bg-paper text-ink/70 hover:border-ink/25"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <V3Input name="payoutName" label="Account / payee name *" placeholder="As it appears on the account" value={payoutName} onChange={(e) => setPayoutName(e.target.value)} />

          {payoutMethod === "bank" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <V3Input name="bankName" label="Bank name *" placeholder="GTBank" value={bankName} onChange={(e) => setBankName(e.target.value)} />
              <V3Input name="accountNumber" label="Account number *" inputMode="numeric" placeholder="0123456789" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
            </div>
          )}
          {payoutMethod === "mobile" && (
            <V3Input name="mobileWallet" label="Mobile money number *" icon={<Phone className="h-4 w-4" />} placeholder="+233 24 000 0000" value={mobileWallet} onChange={(e) => setMobileWallet(e.target.value)} />
          )}
          {payoutMethod === "wallet" && (
            <V3Input name="walletAddress" label="Wallet address (USDC · TRC-20) *" placeholder="T..." className="font-mono" value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)} />
          )}
        </section>

        {/* Terms */}
        <label className="flex items-start gap-3 text-sm leading-relaxed border-t border-ink/15 pt-7">
          <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-1 h-4 w-4 accent-print-green" />
          <span className="text-ink/75">
            I confirm these details are accurate and agree to honour single-use codes issued through Subforme. Listings are subject to admin approval; payouts settle weekly, less the platform fee.
          </span>
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <V3Button type="submit" size="lg" className="flex-1">
            <Receipt className="h-4 w-4" /> Submit listing request <ArrowRight className="h-4 w-4" />
          </V3Button>
          <Link to="/v3/vendor/dashboard" className="text-sm text-ink/60 hover:text-ink">Cancel</Link>
        </div>
      </form>
    </V3AuthShell>
  );
};

export default V3VendorServiceRequest;
