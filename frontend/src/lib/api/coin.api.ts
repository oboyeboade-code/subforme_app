import { apiRequest, ApiResponse } from "./client";

export interface ICoinLedger {
  userId: string;
  voucherId?: string;
  amount: number;
  balanceAfter: number;
  source: "game" | "payment" | "purchase" | "admin_adjustment" | "refund" | "voucher";
  metadata?: {
    gameId?: string;
    paymentId?: string;
    serviceId?: string;
    reason?: string;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
}

export type CoinBalanceData = {
  balance: number;
};

export type CoinTransactionData = {
  balance: number;
  transaction: {
    amount: number;
    balanceAfter: number;
    source: "game" | "payment" | "admin_adjustment" | "purchase";
    createdAt: string;
  };
};

export const coinApi = {
  getBalance(): Promise<ApiResponse<CoinBalanceData>> {
    return apiRequest<CoinBalanceData>("/api/coins/balance");
  },
};
