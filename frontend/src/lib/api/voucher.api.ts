import { apiRequest, ApiResponse } from "./client";

export interface IVoucher {
  _id: string;
  userId?: string;
  code: string;
  valueNaira: number;
  type?: string;
  minOrderValue?: number;
  status: "active" | "used" | "expired";
  issuedAt: string;
  expiresAt?: string;
  usedAt?: string;
  buyerUserIds?: string[];
  isMarketplace?: boolean;
  priceInCoins?: number;
  createdAt: string;
  updatedAt: string;
}

export type Voucher = IVoucher;

export const voucherApi = {
  buyWithCoins(valueNaira: number): Promise<ApiResponse<{
    voucher: { code: string; valueNaira: number; expiresAt: string | null };
    newBalance: number;
    coinsSpent: number;
  }>> {
    return apiRequest<{
      voucher: { code: string; valueNaira: number; expiresAt: string | null };
      newBalance: number;
      coinsSpent: number;
    }>("/api/vouchers/buy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ valueNaira }),
    });
  },

  validateVoucher(code: string, cartTotal: number): Promise<ApiResponse<{
    valid: boolean;
    code: string;
    discountApplied: number;
    newTotal: number;
    expiresAt: string | null;
  }>> {
    return apiRequest<{
      valid: boolean;
      code: string;
      discountApplied: number;
      newTotal: number;
      expiresAt: string | null;
    }>("/api/vouchers/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, cartTotal }),
    });
  },

  listMyVouchers(): Promise<ApiResponse<{
    vouchers: IVoucher[]
  }>> {
    return apiRequest<{vouchers: IVoucher[]}>("/api/vouchers", {
      method: "GET",
    });
  },

  getMarketVouchers(): Promise<ApiResponse<{vouchers: IVoucher[]}>> {
    return apiRequest<{
      vouchers: IVoucher[]
    }>("/api/vouchers/market", {
      method: "GET",
    });
  },
};
