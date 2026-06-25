

export type Offer = {
  price: any;
  id: string;
  provider: string;
  service: string;
  initials: string;
  tag: string;
  cat: string;
  hue: string;
};

export type Service = {
  _id: string;
  vendorBusinessId: string;

  name: string;
  slug: string;
  description?: string;

  category: string;
  tags: string[];

  image: string;
  gallery: string[];

  priceNaira: number;

  durationMinutes?: number;

  isActive: boolean;
  isFeatured: boolean;

  ratingAverage: number;
  ratingCount: number;
};

export type Voucher = {
  discount: string;
  title: string;
  price: number;
  tone: "red" | "orange" | "green";
  hue: string;
};

export type Sub = {
  id: string;
  vendor: string;
  auth: string;
  serv: string;
  status: "active" | "expired";
};

export type BookedService = {
  id: string;
  category: string;
  service: string;
  customer: string;
  bookedAt: string;
  authCode: string;
  redeemCode: string;
};

export type LandingNavLink = { label: string; href: string };

export type LandingStep = {
  no: string;
  title: string;
  body: string;
  accent: string;
  rule: string;
};

export type V3Step = {
  iconName: "Wallet" | "Mail" | "Zap";
  title: string;
  body: string;
};

export type Faq = { q: string; a: string };

export type ProviderCategoryCard = {
  name: string;
  tagline: string;
  accent: string;
  rule: string;
  count: number;
  featured: string[];
};

export type V3VendorCard = {
  iconName: "Coffee" | "Car" | "Scissors" | "ShoppingBag" | "Laptop" | "Dumbbell";
  name: string;
  count: number;
  hue: string;
};

export type AppCategory = {
  name: string;
  iconName: "UtensilsCrossed" | "Car" | "Coffee" | "Film" | "ShoppingCart" | "Sparkles";
};

export type TopProvider = {
  id: string;
  provider: string;
  service: string;
};

export type V3TopProvider = {
  id: string;
  name: string;
  tag: string;
  initials: string;
  hue: string;
};

export type DashboardCartItem = { id: string; title: string; sub: string };
export type WishlistItem = { title: string; cat: string };

export type ProviderCategory =
  | "Food"
  | "Auto"
  | "Cafe"
  | "Cinema"
  | "Groceries"
  | "Other";

export type Provider = {
  id: string;
  name: string;
  category: ProviderCategory;
  state: string;
  country: string;
  services: number;
  status: "active" | "paused";
};

export type CodeStatus = "active" | "used" | "expired";

export type Code = {
  id: string;
  serviceId: string
  customerId: string;

  code: string;

  issuedAt: string | Date;
  expiresAt?: string | null;

  status: CodeStatus;

  // optional populated relation (based on adaptCustomerFromCode)
  userId?: string | {
    _id: string;
    email?: string;
    phone?: string;
  };
};

export type CodeRow = {
  id: string;
  serviceId: string;
  customerId: string;
  code: string;
  issuedAt: string;
  expiresAt: string;
  status: "active" | "expired" | "redeemed";
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinedAt: string;
};

export type AdminAccount = {
  id: string;
  name: string;
  email: string;
  role: "Super Admin" | "Regional Admin";
  country: string;
  state: string;
};

export const LANDING_NAV: LandingNavLink[] = [
  { label: "FAQs", href: "#faqs" },
  { label: "Vendor Login", href: "/vendor-login" },
  { label: "Providers", href: "#providers" },
  { label: "Register", href: "/register" },
];

export const LANDING_STEPS: LandingStep[] = [
  {
    no: "01",
    title: "Buy a bundle",
    body: "Pick a vendor you visit often. Pay once for N uses — lunches, washes, coffees, groceries.",
    accent: "text-print-red",
    rule: "bg-print-red",
  },
  {
    no: "02",
    title: "Codes by email",
    body: "We email you N single-use codes within two minutes. One code equals one service unit.",
    accent: "text-print-orange",
    rule: "bg-print-orange",
  },
  {
    no: "03",
    title: "Show & redeem",
    body: "At the counter, read out a code. The vendor redeems it in seconds. No network. No cash. No struggle.",
    accent: "text-print-green",
    rule: "bg-print-green",
  },
];

export const LANDING_FAQS: Faq[] = [
  {
    q: "What happens if my network fails at the counter?",
    a: "Nothing. Your codes are already in your inbox from the moment you bought the bundle. Read one out and you're done — no transfer required at point of sale.",
  },
  {
    q: "Can I get a cash refund on unused codes?",
    a: "Not in v1. We don't issue cash refunds. If a provider exits the platform, your unused value converts to Subforme coins you can spend with another provider.",
  },
  {
    q: "What if I lose the email with my codes?",
    a: "Contact support and we'll resend it. A future release will let you reveal codes inside the app for extra convenience.",
  },
  {
    q: "Can a code be used twice or at the wrong vendor?",
    a: "No. Every code is single-use and locked to the issuing provider. Once redeemed, it flips from unused to used and can never be reused.",
  },
  {
    q: "How do I become a provider on Subforme?",
    a: "Subforme is invite-only in v1. Our admin team onboards each provider and sets up their services. Reach out via the Vendor Login link to start a conversation.",
  },
];

export const LANDING_PROVIDER_CATEGORIES: ProviderCategoryCard[] = [
  {
    name: "Food & Drink",
    tagline: "Daily lunches, coffee runs, neighborhood kitchens.",
    accent: "text-print-red",
    rule: "bg-print-red",
    count: 24,
    featured: ["Foody Café", "Mama Tinu Kitchen", "Brew & Bean"],
  },
  {
    name: "Auto & Wash",
    tagline: "Car washes, monthly servicing, quick detailing.",
    accent: "text-print-orange",
    rule: "bg-print-orange",
    count: 11,
    featured: ["Quick Wash", "Mr Zdb Motors", "Shine & Go"],
  },
  {
    name: "Beauty & Spa",
    tagline: "Cuts, braiding, facials, massages — pre-booked.",
    accent: "text-print-green",
    rule: "bg-print-green",
    count: 18,
    featured: ["The Hair Studio", "Glow Spa", "Crown Braids"],
  },
  {
    name: "Groceries & Essentials",
    tagline: "Bulk monthly buys from your trusted local shop.",
    accent: "text-print-red",
    rule: "bg-print-red",
    count: 9,
    featured: ["Uncle B Mart", "Corner Grocers", "Fresh Daily"],
  },
  {
    name: "Co-working & Cafés",
    tagline: "Power, Wi-Fi, and a desk — paid by the visit.",
    accent: "text-print-orange",
    rule: "bg-print-orange",
    count: 7,
    featured: ["Turi's Corner", "Plug Café", "Quiet Desk"],
  },
  {
    name: "Wellness & Fitness",
    tagline: "Gym sessions, yoga drop-ins, physio visits.",
    accent: "text-print-green",
    rule: "bg-print-green",
    count: 6,
    featured: ["Iron Yard", "Stretch Studio", "Reset Physio"],
  },
];

export const V3_NAV: LandingNavLink[] = [
  { label: "How it works", href: "#how" },
  { label: "Vendors", href: "#vendors" },
  { label: "FAQ", href: "#faq" },
  { label: "For vendors", href: "/v3/vendor-login" },
];

export const V3_STEPS: V3Step[] = [
  {
    iconName: "Wallet",
    title: "Buy a bundle",
    body: "Pick a vendor you visit often. Pay once for N uses — coffee, lunch, washes, anything.",
  },
  {
    iconName: "Mail",
    title: "Codes by email",
    body: "We send N single-use codes to your inbox in under 2 minutes. One code = one service.",
  },
  {
    iconName: "Zap",
    title: "Read & redeem",
    body: "At the counter, read out a code. Done in under 10 seconds. No network, no cash.",
  },
];

export const V3_VENDORS: V3VendorCard[] = [
  { iconName: "Coffee", name: "Food & Drink", count: 24, hue: "from-print-red/15 to-print-orange/15" },
  { iconName: "Car", name: "Auto & Wash", count: 11, hue: "from-print-orange/15 to-print-red/10" },
  { iconName: "Scissors", name: "Beauty & Spa", count: 18, hue: "from-print-green/15 to-print-orange/10" },
  { iconName: "ShoppingBag", name: "Groceries", count: 9, hue: "from-print-red/15 to-print-green/10" },
  { iconName: "Laptop", name: "Co-working", count: 7, hue: "from-print-orange/15 to-print-green/10" },
  { iconName: "Dumbbell", name: "Wellness", count: 6, hue: "from-print-green/15 to-print-red/10" },
];

export const V3_FAQS: Faq[] = [
  { q: "What if my network fails?", a: "Your codes are already in your inbox. Read one out — no transfer needed." },
  { q: "Can a code be used twice?", a: "No. Every code is single-use and locked to the issuing vendor." },
  { q: "Can I refund unused codes?", a: "Not for cash. Unused value converts to Subforme coins, spendable elsewhere." },
  { q: "How do I become a vendor?", a: "Vendors are invite-only. Reach out via the vendor portal and our team will onboard you." },
];

export const TOP_PROVIDERS: TopProvider[] = [
  { id: "off_001", provider: "Captain Cook", service: "Burger Combo" },
  { id: "off_002", provider: "Forks & Finger", service: "Chicken Meal" },
  { id: "off_003", provider: "Mama Ruka", service: "Rice Bowl" },
  { id: "off_004", provider: "Bean House", service: "Espresso Deal" },
  { id: "off_005", provider: "Price Mart", service: "Weekly Groceries Pack" },
  { id: "off_006", provider: "Bintinlaye", service: "Oil Change Deal" },
];

export const V3_TOP_PROVIDERS: V3TopProvider[] = [
  { id: "off_001", name: "Captain Cook", tag: "Food", initials: "CC", hue: "from-print-red/15 to-print-orange/10" },
  { id: "off_002", name: "Forks & Finger", tag: "Food", initials: "FF", hue: "from-print-orange/15 to-print-red/10" },
  { id: "off_003", name: "Meemah", tag: "Cafe", initials: "ME", hue: "from-print-orange/15 to-print-green/10" },
  { id: "off_004", name: "Mama Ruka", tag: "Food", initials: "MR", hue: "from-print-green/15 to-print-orange/10" },
  { id: "off_005", name: "Bintinlaye", tag: "Auto", initials: "BL", hue: "from-print-green/15 to-print-red/10" },
  { id: "off_006", name: "Price Mart", tag: "Groceries", initials: "PM", hue: "from-print-red/10 to-print-green/10" },
];

export const APP_CATEGORIES_SIMPLE: string[] = [
  "Food",
  "Auto",
  "Cafe",
  "Cinema",
  "Groceries",
  "More",
];

export const V3_APP_CATEGORIES: AppCategory[] = [
  { name: "Food", iconName: "UtensilsCrossed" },
  { name: "Auto", iconName: "Car" },
  { name: "Cafe", iconName: "Coffee" },
  { name: "Cinema", iconName: "Film" },
  { name: "Groceries", iconName: "ShoppingCart" },
  { name: "More", iconName: "Sparkles" },
];

export const ALL_OFFER_CATEGORIES: string[] = [
  "Food",
  "Cafe",
  "Groceries",
  "Auto",
  "Fitness",
  "Beauty",
  "Tech",
  "Travel",
  "Laundry",
  "Cinema",
];

export const OFFERS: Offer[] = [
  {
    id: "off_001",
    provider: "Captain Cook",
    service: "Burger Combo",
    price: 8500,
    initials: "CC",
    tag: "40% OFF",
    cat: "Food",
    hue: "from-print-red/20 to-print-orange/10",
  },
  {
    id: "off_002",
    provider: "Forks & Finger",
    service: "Chicken Meal",
    price: 7200,
    initials: "FF",
    tag: "25% OFF",
    cat: "Food",
    hue: "from-print-orange/20 to-print-red/10",
  },
  {
    id: "off_003",
    provider: "Mama Ruka",
    service: "Rice Bowl",
    price: 4500,
    initials: "MR",
    tag: "15% OFF",
    cat: "Food",
    hue: "from-print-green/15 to-print-orange/10",
  },
  {
    id: "off_004",
    provider: "Bean House",
    service: "Espresso Deal",
    price: 3200,
    initials: "BH",
    tag: "30% OFF",
    cat: "Cafe",
    hue: "from-print-green/20 to-print-orange/10",
  },
  {
    id: "off_005",
    provider: "Price Mart",
    service: "Weekly Groceries Pack",
    price: 18500,
    initials: "PM",
    tag: "10% OFF",
    cat: "Groceries",
    hue: "from-print-red/15 to-print-green/10",
  },
  {
    id: "off_006",
    provider: "Bintinlaye",
    service: "Oil Change Deal",
    price: 12000,
    initials: "BL",
    tag: "20% OFF",
    cat: "Auto",
    hue: "from-ink/10 to-print-orange/10",
  },
];

export const VOUCHERS: Voucher[] = [
  { discount: "40%", title: "Premium Voucher", price: 2000, tone: "red", hue: "from-print-red to-print-orange" },
  { discount: "15%", title: "Regular Voucher", price: 1000, tone: "orange", hue: "from-print-orange to-[hsl(40,90%,55%)]" },
  { discount: "60%", title: "Premium Plus", price: 4000, tone: "green", hue: "from-print-green to-print-orange" },
];

export const SUBS: Sub[] = [
  { id: "1", vendor: "Captain Cook", auth: "AUTH-12345", serv: "SERV-67890", status: "active" },
  { id: "2", vendor: "Spa Premium", auth: "AUTH-22222", serv: "SERV-99999", status: "active" },
  { id: "3", vendor: "Bean House", auth: "AUTH-33333", serv: "SERV-44444", status: "active" },
  { id: "4", vendor: "Gym Access", auth: "AUTH-55555", serv: "SERV-11111", status: "expired" },
];

export const VENDOR_BOOKED_SERVICES: BookedService[] = [
  { id: "b-001", category: "Hair Services", service: "Haircut Booking", customer: "Ada O.", bookedAt: "Today · 09:14", authCode: "AUTH-12345", redeemCode: "REDEEM-67890" },
  { id: "b-002", category: "Hair Services", service: "Braiding", customer: "Miss Turi", bookedAt: "Today · 10:02", authCode: "AUTH-22222", redeemCode: "REDEEM-99999" },
  { id: "b-003", category: "Hair Services", service: "Haircut Booking", customer: "Mr Zdb", bookedAt: "Yesterday · 17:40", authCode: "AUTH-31415", redeemCode: "REDEEM-27182" },
  { id: "b-004", category: "Spa Services", service: "Facial Treatment", customer: "Uncle B", bookedAt: "Today · 08:30", authCode: "AUTH-55555", redeemCode: "REDEEM-11111" },
  { id: "b-005", category: "Spa Services", service: "Deep Tissue Massage", customer: "Ada O.", bookedAt: "Today · 11:15", authCode: "AUTH-77777", redeemCode: "REDEEM-33333" },
];

export const DASHBOARD_CART_ITEMS: DashboardCartItem[] = [
  { id: "off_001", title: "Burger Combo", sub: "Captain Cook · 2,000 coins" },
  { id: "off_004", title: "Espresso Deal", sub: "Bean House · 1,500 coins" },
];

export const DASHBOARD_WISHLIST: WishlistItem[] = [
  { title: "Hair Styling", cat: "Beauty" },
  { title: "Cinema Pass", cat: "Cinema" },
  { title: "Brunch x10", cat: "Food" },
];

export const PROVIDER_CATEGORIES: ProviderCategory[] = [
  "Food",
  "Auto",
  "Cafe",
  "Cinema",
  "Groceries",
  "Other",
];

export const PROVIDERS: Provider[] = [
  { id: "p1", name: "Captain Cook", category: "Food", state: "Lagos", country: "Nigeria", services: 6, status: "active" },
  { id: "p2", name: "Forks & Finger", category: "Food", state: "Lagos", country: "Nigeria", services: 4, status: "active" },
  { id: "p3", name: "Meemah", category: "Food", state: "Abuja", country: "Nigeria", services: 3, status: "active" },
  { id: "p4", name: "Mama Ruka", category: "Food", state: "Kano", country: "Nigeria", services: 2, status: "paused" },
  { id: "p5", name: "Bintinlaye Auto", category: "Auto", state: "Lagos", country: "Nigeria", services: 5, status: "active" },
  { id: "p6", name: "Price Mart Motors", category: "Auto", state: "Rivers", country: "Nigeria", services: 3, status: "active" },
  { id: "p7", name: "Café Noir", category: "Cafe", state: "Lagos", country: "Nigeria", services: 2, status: "active" },
  { id: "p8", name: "Roastery Lane", category: "Cafe", state: "Abuja", country: "Nigeria", services: 2, status: "active" },
  { id: "p9", name: "Silverbird Cinemas", category: "Cinema", state: "Lagos", country: "Nigeria", services: 3, status: "active" },
  { id: "p10", name: "Filmhouse", category: "Cinema", state: "Oyo", country: "Nigeria", services: 4, status: "active" },
  { id: "p11", name: "Shoprite Express", category: "Groceries", state: "Lagos", country: "Nigeria", services: 6, status: "active" },
  { id: "p12", name: "Market Square", category: "Groceries", state: "Enugu", country: "Nigeria", services: 5, status: "active" },
  { id: "p13", name: "FreshFarms", category: "Groceries", state: "Kaduna", country: "Nigeria", services: 3, status: "paused" },
  { id: "p14", name: "Glow Spa", category: "Other", state: "Lagos", country: "Nigeria", services: 2, status: "active" },
];

export const SERVICES: Service[] = [
  {
    _id: "s1",
    vendorBusinessId: "v1",
    name: "Lunch Combo Pack",
    slug: "lunch-combo-pack",
    description: "Affordable lunch combo meal package.",
    category: "Food",
    tags: ["food", "meal", "lunch"],
    image: "/images/lunch.jpg",
    gallery: [],
    priceNaira: 4500,
    durationMinutes: 30,
    isActive: true,
    isFeatured: false,
    ratingAverage: 4.3,
    ratingCount: 120,
  },

  {
    _id: "s2",
    vendorBusinessId: "v1",
    name: "Family Dinner",
    slug: "family-dinner",
    description: "Dinner package for family gatherings.",
    category: "Food",
    tags: ["food", "dinner"],
    image: "/images/dinner.jpg",
    gallery: [],
    priceNaira: 12000,
    durationMinutes: 60,
    isActive: true,
    isFeatured: true,
    ratingAverage: 4.6,
    ratingCount: 85,
  },

  {
    _id: "s3",
    vendorBusinessId: "v2",
    name: "Quick Bites Voucher",
    slug: "quick-bites-voucher",
    description: "Fast snack voucher for quick meals.",
    category: "Food",
    tags: ["snack", "fast-food"],
    image: "/images/snack.jpg",
    gallery: [],
    priceNaira: 2000,
    durationMinutes: 15,
    isActive: true,
    isFeatured: false,
    ratingAverage: 4.1,
    ratingCount: 240,
  },

  {
    _id: "s4",
    vendorBusinessId: "v3",
    name: "Brunch for Two",
    slug: "brunch-for-two",
    description: "Weekend brunch package for two people.",
    category: "Food",
    tags: ["brunch"],
    image: "/images/brunch.jpg",
    gallery: [],
    priceNaira: 7500,
    durationMinutes: 45,
    isActive: true,
    isFeatured: false,
    ratingAverage: 4.5,
    ratingCount: 60,
  },

  {
    _id: "s5",
    vendorBusinessId: "v4",
    name: "Oil Change Service",
    slug: "oil-change-service",
    description: "Full engine oil replacement service.",
    category: "Auto",
    tags: ["car", "maintenance"],
    image: "/images/oil.jpg",
    gallery: [],
    priceNaira: 15000,
    durationMinutes: 60,
    isActive: true,
    isFeatured: false,
    ratingAverage: 4.4,
    ratingCount: 44,
  },

  {
    _id: "s6",
    vendorBusinessId: "v4",
    name: "Premium Detail Wash",
    slug: "premium-detail-wash",
    description: "Full car wash and detailing service.",
    category: "Auto",
    tags: ["car", "wash"],
    image: "/images/wash.jpg",
    gallery: [],
    priceNaira: 25000,
    durationMinutes: 90,
    isActive: true,
    isFeatured: true,
    ratingAverage: 4.7,
    ratingCount: 70,
  },

  {
    _id: "s7",
    vendorBusinessId: "v5",
    name: "Espresso Pass · 10x",
    slug: "espresso-pass-10x",
    description: "10 espresso drinks bundle.",
    category: "Cafe",
    tags: ["coffee"],
    image: "/images/espresso.jpg",
    gallery: [],
    priceNaira: 8000,
    durationMinutes: 0,
    isActive: true,
    isFeatured: false,
    ratingAverage: 4.2,
    ratingCount: 190,
  },

  {
    _id: "s8",
    vendorBusinessId: "v5",
    name: "Latte Lover Bundle",
    slug: "latte-lover-bundle",
    description: "Discounted latte bundle for coffee lovers.",
    category: "Cafe",
    tags: ["coffee", "latte"],
    image: "/images/latte.jpg",
    gallery: [],
    priceNaira: 10500,
    durationMinutes: 0,
    isActive: true,
    isFeatured: true,
    ratingAverage: 4.6,
    ratingCount: 140,
  },

  {
    _id: "s9",
    vendorBusinessId: "v6",
    name: "Movie Night Ticket",
    slug: "movie-night-ticket",
    description: "Standard cinema ticket for movie night.",
    category: "Cinema",
    tags: ["movie"],
    image: "/images/movie.jpg",
    gallery: [],
    priceNaira: 3500,
    durationMinutes: 120,
    isActive: true,
    isFeatured: false,
    ratingAverage: 4.3,
    ratingCount: 300,
  },

  {
    _id: "s10",
    vendorBusinessId: "v6",
    name: "VIP Recliner Pass",
    slug: "vip-recliner-pass",
    description: "Premium cinema experience with recliner seats.",
    category: "Cinema",
    tags: ["vip", "cinema"],
    image: "/images/vip.jpg",
    gallery: [],
    priceNaira: 8000,
    durationMinutes: 120,
    isActive: true,
    isFeatured: true,
    ratingAverage: 4.8,
    ratingCount: 210,
  },

  {
    _id: "s11",
    vendorBusinessId: "v7",
    name: "Weekly Groceries Pack",
    slug: "weekly-groceries-pack",
    description: "Essential weekly grocery package.",
    category: "Groceries",
    tags: ["food", "shopping"],
    image: "/images/groceries.jpg",
    gallery: [],
    priceNaira: 20000,
    durationMinutes: 0,
    isActive: true,
    isFeatured: false,
    ratingAverage: 4.4,
    ratingCount: 510,
  },

  {
    _id: "s12",
    vendorBusinessId: "v7",
    name: "Pantry Essentials",
    slug: "pantry-essentials",
    description: "Basic household pantry essentials bundle.",
    category: "Groceries",
    tags: ["home"],
    image: "/images/pantry.jpg",
    gallery: [],
    priceNaira: 12000,
    durationMinutes: 0,
    isActive: true,
    isFeatured: false,
    ratingAverage: 4.2,
    ratingCount: 380,
  },
];

export const CUSTOMERS: Customer[] = [
  { id: "c1", name: "Aisha Bello", email: "aisha@example.com", phone: "+234 803 111 2233", joinedAt: "2025-02-12" },
  { id: "c2", name: "Tunde Akin", email: "tunde@example.com", phone: "+234 805 222 3344", joinedAt: "2025-03-04" },
  { id: "c3", name: "Chinwe Okafor", email: "chinwe@example.com", phone: "+234 807 333 4455", joinedAt: "2025-01-20" },
  { id: "c4", name: "Femi Ade", email: "femi@example.com", phone: "+234 802 444 5566", joinedAt: "2025-04-09" },
  { id: "c5", name: "Zainab Yusuf", email: "zainab@example.com", phone: "+234 809 555 6677", joinedAt: "2025-02-28" },
  { id: "c6", name: "Daniel Eze", email: "daniel@example.com", phone: "+234 810 666 7788", joinedAt: "2025-03-22" },
  { id: "c7", name: "Halima Sani", email: "halima@example.com", phone: "+234 811 777 8899", joinedAt: "2025-04-15" },
  { id: "c8", name: "Kunle Ojo", email: "kunle@example.com", phone: "+234 812 888 9900", joinedAt: "2025-01-08" },
];

export const CODES: CodeRow[] = [
  { id: "k1", serviceId: "s1", customerId: "c1", code: "SF-A91X-2K", issuedAt: "2026-04-02", expiresAt: "2026-07-02", status: "active" },
  { id: "k2", serviceId: "s9", customerId: "c1", code: "SF-MV44-7B", issuedAt: "2026-03-12", expiresAt: "2026-04-12", status: "expired" },
  { id: "k3", serviceId: "s7", customerId: "c1", code: "SF-EX02-9P", issuedAt: "2026-04-22", expiresAt: "2026-08-22", status: "active" },
  { id: "k4", serviceId: "s3", customerId: "c2", code: "SF-QB33-1M", issuedAt: "2026-04-18", expiresAt: "2026-06-18", status: "active" },
  { id: "k5", serviceId: "s5", customerId: "c2", code: "SF-AU88-5L", issuedAt: "2026-02-10", expiresAt: "2026-03-10", status: "expired" },
  { id: "k6", serviceId: "s11", customerId: "c3", code: "SF-GR67-4N", issuedAt: "2026-04-28", expiresAt: "2026-05-28", status: "active" },
  { id: "k7", serviceId: "s8", customerId: "c3", code: "SF-LA21-6V", issuedAt: "2026-03-30", expiresAt: "2026-04-30", status: "expired" },
  { id: "k8", serviceId: "s2", customerId: "c4", code: "SF-FD55-3J", issuedAt: "2026-04-25", expiresAt: "2026-07-25", status: "active" },
  { id: "k9", serviceId: "s10", customerId: "c5", code: "SF-VP19-8C", issuedAt: "2026-04-19", expiresAt: "2026-06-19", status: "active" },
  { id: "k10", serviceId: "s12", customerId: "c5", code: "SF-PE40-2D", issuedAt: "2026-02-14", expiresAt: "2026-03-14", status: "expired" },
  { id: "k11", serviceId: "s4", customerId: "c6", code: "SF-BR77-0H", issuedAt: "2026-04-30", expiresAt: "2026-06-30", status: "active" },
  { id: "k12", serviceId: "s6", customerId: "c7", code: "SF-PD12-9Q", issuedAt: "2026-04-15", expiresAt: "2026-08-15", status: "active" },
  { id: "k13", serviceId: "s1", customerId: "c8", code: "SF-LC33-4F", issuedAt: "2026-03-05", expiresAt: "2026-04-05", status: "expired" },
  { id: "k14", serviceId: "s9", customerId: "c8", code: "SF-MV90-7G", issuedAt: "2026-04-26", expiresAt: "2026-05-26", status: "active" },
];

export const ADMINS: AdminAccount[] = [
  { id: "a1", name: "Admin User", email: "admin@subforme.com", role: "Super Admin", country: "Nigeria", state: "—" },
  { id: "a2", name: "Olamide Bakare", email: "olamide@subforme.com", role: "Regional Admin", country: "Nigeria", state: "Lagos" },
  { id: "a3", name: "Yusuf Mohammed", email: "yusuf@subforme.com", role: "Regional Admin", country: "Nigeria", state: "Kano" },
  { id: "a4", name: "Ifeoma Eze", email: "ifeoma@subforme.com", role: "Regional Admin", country: "Nigeria", state: "Abuja" },
];

export type VendorProfile = {
  name: string;
  tagline: string;
  category: string;
  location: string;
  joined: string;
  rating: number;
  totalRedemptions: number;
};

export type VendorService = {
  id: string;
  category: string;
  name: string;
  description: string;
  priceNaira: number;
  durationMinutes?: number;
  active: boolean;
};

export const VENDOR_PROFILE: VendorProfile = {
  name: "Foody Café",
  tagline: "Wholesome plates, hand-pulled brews, slow afternoons.",
  category: "Cafe · Food",
  location: "Lagos, Nigeria",
  joined: "Jan 2024",
  rating: 4.8,
  totalRedemptions: 1284,
};

export const VENDOR_SERVICES: VendorService[] = [
  { id: "vs1", category: "Hair Services", name: "Haircut Booking", description: "Classic cut and finish, 30-min slot.", priceNaira: 4500, durationMinutes: 30, active: true },
  { id: "vs2", category: "Hair Services", name: "Braiding", description: "Knotless braids — small / medium.", priceNaira: 15000, durationMinutes: 180, active: true },
  { id: "vs3", category: "Spa Services", name: "Facial Treatment", description: "Deep-clean + hydration, 45-min slot.", priceNaira: 9000, durationMinutes: 45, active: true },
  { id: "vs4", category: "Spa Services", name: "Deep Tissue Massage", description: "60-min full body, targeted pressure.", priceNaira: 12000, durationMinutes: 60, active: true },
  { id: "vs5", category: "Cafe", name: "Brunch Set", description: "House brunch plate + drink of choice.", priceNaira: 6500, durationMinutes: 0, active: false },
];