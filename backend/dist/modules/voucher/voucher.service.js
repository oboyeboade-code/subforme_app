import mongoose from "mongoose";
import crypto from "crypto";
import { AppError } from "../../middleware/errorMiddleware.js";
import { VoucherModel } from "./voucher.model.js";
import { coinService } from "../coin/coin.service.js";
export const voucherService = {
    buyWithCoins: async (userId, valueNaira) => {
        if (!mongoose.Types.ObjectId.isValid(userId))
            throw new AppError("Invalid user id", 400);
        if (valueNaira <= 0)
            throw new AppError("Voucher value must be positive", 400);
        const COINS_PER_NAIRA = 0.1;
        const coinsCost = Math.ceil(valueNaira * COINS_PER_NAIRA);
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const { balance } = await coinService.spendCoins(userId, coinsCost, "purchase", { voucherValueNaira: valueNaira }, session);
            const code = `VCH-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
            const voucher = await VoucherModel.create([{ userId, code, valueNaira, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }], { session });
            await session.commitTransaction();
            return { voucher: voucher[0], newBalance: balance, coinsSpent: coinsCost };
        }
        catch (error) {
            await session.abortTransaction();
            throw error;
        }
        finally {
            session.endSession();
        }
    },
    validateForCheckout: async (userId, code, cartTotalNaira) => {
        if (!mongoose.Types.ObjectId.isValid(userId))
            throw new AppError("Invalid user id", 400);
        if (!code)
            throw new AppError("Voucher code is required", 400);
        const voucher = await VoucherModel.findOne({
            userId,
            code: code.toUpperCase(),
            status: "active",
            $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
        }).lean();
        if (!voucher)
            throw new AppError("Invalid, expired, or already used voucher", 400);
        const discountApplied = Math.min(voucher.valueNaira, cartTotalNaira);
        const newTotal = cartTotalNaira - discountApplied;
        return { valid: true, code: voucher.code, discountApplied, newTotal, expiresAt: voucher.expiresAt };
    },
    consumeAfterPayment: async (userId, code, orderId) => {
        const voucher = await VoucherModel.findOneAndUpdate({ userId, code: code.toUpperCase(), status: "active" }, { status: "used", usedAt: new Date(), orderId }, { new: true });
        if (!voucher)
            throw new AppError("Voucher not found or already used", 400);
        return voucher;
    },
    listUserVouchers: async (userId) => {
        if (!mongoose.Types.ObjectId.isValid(userId))
            throw new AppError("Invalid user id", 400);
        const vouchers = await VoucherModel.find({ userId }).sort({ createdAt: -1 }).lean();
        return vouchers;
    },
    getMarketplaceVouchers: async () => {
        const vouchers = await VoucherModel.find({
            isMarketplace: true,
            status: "active",
            $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
        })
            .sort({ priceInCoins: 1 })
            .lean();
        return vouchers;
    },
};
//# sourceMappingURL=voucher.service.js.map