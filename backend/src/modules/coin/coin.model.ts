import mongoose, { Schema, Document } from "mongoose";

export type CoinSource =
  | "game"
  | "payment"
  | "purchase"
  | "admin_adjustment"
  | "refund"
  | "voucher";

export interface ICoinLedger extends Document {
  userId: mongoose.Types.ObjectId;
  voucherId?: mongoose.Types.ObjectId;
  amount: number;
  balanceAfter: number;
  source: CoinSource;
  metadata?: {
    gameId?: string;
    paymentId?: mongoose.Types.ObjectId;
    serviceId?: mongoose.Types.ObjectId;
    reason?: string;
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

const CoinLedgerSchema = new Schema<ICoinLedger>(
  {
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
  },
  { timestamps: true }
);

CoinLedgerSchema.index({ userId: 1, createdAt: -1 });

export const CoinLedgerModel = mongoose.model<ICoinLedger>(
  "CoinLedger",
  CoinLedgerSchema
);
