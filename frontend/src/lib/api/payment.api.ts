import { apiRequest, ApiResponse } from "./client";

export interface IPayment {
  userId: string;
  orderId?: string;
  bookingIds?: string[];
  transactionReference?: string;
  channel?: string;
  status: "pending" | "succeeded" | "failed";
  errorMessage?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type PaystackInit = {
  reference: string;
  authorization_url: string;
  access_code: string;
};

export const paymentApi = {
  initPayment(payload: {
    items: Array<{ serviceId: string; qty: number; branch?: string; date?: string }>;
    cartTotal: number;
    email: string;
    voucherCode?: string;
    discountApplied?: number;
    callbackPath?: string;
  }): Promise<ApiResponse<PaystackInit>> {
    return apiRequest<PaystackInit>("/api/payments/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },

  verifyPayment(reference: string): Promise<ApiResponse<any>> {
    return apiRequest<any>(
      `/api/payments/verify/${encodeURIComponent(reference)}`,
      { method: "GET" }
    );
  },
};
