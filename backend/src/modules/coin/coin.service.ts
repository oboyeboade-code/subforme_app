import mongoose from "mongoose";
import { AppError } from "../../middleware/errorMiddleware.js";
import { CustomerModel } from "../user/user.model.js";
import { CoinLedgerModel, CoinSource } from "./coin.model.js";

export const coinService = {
  addCoins: async (
    userId: string,
    amount: number,
    type: CoinSource,
    metadata: Record<string, any> = {}
  ) => {
    if (!mongoose.Types.ObjectId.isValid(userId)) throw new AppError("Invalid user id", 400);
    if (amount <= 0) throw new AppError("Amount must be positive", 400);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const customer = await CustomerModel.findByIdAndUpdate(
        userId,
        { $inc: { coins: amount } },
        { new: true, session, runValidators: true }
      ).select("coins");

      if (!customer) throw new AppError("Customer not found", 404);

      await CoinLedgerModel.create(
        [{ userId, amount, balanceAfter: customer.coins, source: type, metadata }],
        { session }
      );

      await session.commitTransaction();
      return { balance: customer.coins };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },

  spendCoins: async (
    userId: string,
    amount: number,
    type: CoinSource,
    metadata: Record<string, any> = {},
    session?: mongoose.ClientSession
  ) => {
    if (!mongoose.Types.ObjectId.isValid(userId)) throw new AppError("Invalid user id", 400);
    if (amount <= 0) throw new AppError("Amount must be positive", 400);

    let newSession = false;
    if (!session) {
      session = await mongoose.startSession();
      session.startTransaction();
      newSession = true;
    }

    try {
      const customer = await CustomerModel.findOneAndUpdate(
        { _id: userId, coins: { $gte: amount } },
        { $inc: { coins: -amount } },
        { new: true, session: session }
      ).select("coins");

      if (!customer) throw new AppError("Insufficient coins or customer not found", 400);

      await CoinLedgerModel.create(
        [{ userId, amount: -amount, balanceAfter: customer.coins, source: type, metadata }],
        { session: session }
      );

      if (newSession) {
        await session.commitTransaction();
      }
      return { balance: customer.coins };
    } catch (error) {
      if (newSession) {
        await session.abortTransaction();
      }
      throw error;
    } finally {
      if (newSession) {
        session.endSession();
      }
    }
  },

  getBalance: async (userId: string) => {
    if (!mongoose.Types.ObjectId.isValid(userId)) throw new AppError("Invalid user id", 400);
    const customer = await CustomerModel.findById(userId).select("coins").lean();
    if (!customer) throw new AppError("Customer not found", 404);
    return { balance: customer.coins };
  },
};
