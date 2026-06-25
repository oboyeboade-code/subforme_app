// Aggregator shim for legacy `../models/user.model` imports.
// Re-exports the canonical models from their new module homes.
export * from "../user/user.model.js";
export { ProfileModel } from "../user/profile.model.js";
export { ServiceModel } from "../service/service.model.js";
export { ServiceCodeModel } from "../service/serviceCode.model.js";
export { CoinLedgerModel } from "../coin/coin.model.js";
export { VoucherModel } from "../voucher/voucher.model.js";
export { VendorBusinessModel } from "../vendorBusiness/vendorBusiness.model.js";
export const OfferModel = {}; // compat placeholder
//# sourceMappingURL=user.model.js.map