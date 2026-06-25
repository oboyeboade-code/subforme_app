import mongoose, { Schema } from "mongoose";
const CoinLedgerSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    voucherId: { type: Schema.Types.ObjectId, ref: "Voucher" },
    amount: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    source: {
        type: String,
        enum: ["game", "payment", "purchase", "admin_adjustment", "refund", "voucher"],
        required: true,
    },
    metadata: { type: Schema.Types.Mixed, default: {} },
}, { timestamps: true });
CoinLedgerSchema.index({ userId: 1, createdAt: -1 });
export const CoinLedgerModel = mongoose.model("CoinLedger", CoinLedgerSchema);
//# sourceMappingURL=coin.model.js.map