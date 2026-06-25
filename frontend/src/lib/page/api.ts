import * as DATA from "./data";

export type {
  Offer,
  Voucher,
  Sub,
  BookedService,
  LandingNavLink,
  LandingStep,
  V3Step,
  Faq,
  ProviderCategoryCard,
  V3VendorCard,
  AppCategory,
  TopProvider,
  V3TopProvider,
  DashboardCartItem,
  WishlistItem,
  Provider,
  ProviderCategory,
  Service,
  CodeRow,
  Customer,
  AdminAccount,
  VendorProfile,
  VendorService,
} from "./data";


const tick = <T>(value: T, ms = 0): Promise<T> =>
  ms > 0 ? new Promise((r) => setTimeout(() => r(value), ms)) : Promise.resolve(value);

export const api = {

  getLandingNav:        () => tick(DATA.LANDING_NAV),
  getLandingSteps:      () => tick(DATA.LANDING_STEPS),
  getLandingFaqs:       () => tick(DATA.LANDING_FAQS),
  getLandingProviderCategories: () => tick(DATA.LANDING_PROVIDER_CATEGORIES),

  getV3Nav:             () => tick(DATA.V3_NAV),
  getV3Steps:           () => tick(DATA.V3_STEPS),
  getV3Vendors:         () => tick(DATA.V3_VENDORS),
  getV3Faqs:            () => tick(DATA.V3_FAQS),

  listVouchers:         () => tick(DATA.VOUCHERS),
  listCodes:            () => tick(DATA.CODES),



//   getTopProviders:      () => tick(DATA.TOP_PROVIDERS),
//   getV3TopProviders:    () => tick(DATA.V3_TOP_PROVIDERS),
//   getAppCategoriesSimple: () => tick(DATA.APP_CATEGORIES_SIMPLE),
//   getV3AppCategories:   () => tick(DATA.V3_APP_CATEGORIES),

//   listOffers:           () => tick(DATA.OFFERS),
//   getOffer:             (id: string) =>
//     tick(DATA.OFFERS.find((o) => o.id === id) ?? null),
//   listOfferCategories:  () => tick(DATA.ALL_OFFER_CATEGORIES),



//   listSubs:             () => tick(DATA.SUBS),

//   listVendorBookings:   () => tick(DATA.VENDOR_BOOKED_SERVICES),
//   getVendorProfile:     () => tick(DATA.VENDOR_PROFILE),
//   listVendorServices:   () => tick(DATA.VENDOR_SERVICES),

//   getDashboardCart:     () => tick(DATA.DASHBOARD_CART_ITEMS),
//   getDashboardWishlist: () => tick(DATA.DASHBOARD_WISHLIST),

//   listProviders:        () => tick(DATA.PROVIDERS),

//   listCustomers:        () => tick(DATA.CUSTOMERS),
//   listAdmins:           () => tick(DATA.ADMINS),
//   listProviderCategories: () => tick(DATA.PROVIDER_CATEGORIES),
};