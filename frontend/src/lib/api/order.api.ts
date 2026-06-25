import { apiRequest, ApiResponse } from "./client";

export interface IOrder {
  ref: string;
  userId: string;
  bookingIds?: string[];
  paymentId?: string;
  currency?: string;
  subtotal: number;
  discount?: number;
  total: number;
  totalPaid: number;
  status: "pending" | "paid" | "failed";
  voucherCode?: string;
  voucherDiscount?: number;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type Order = IOrder;

export const orderApi = {
  getOrderByRef(ref: string): Promise<ApiResponse<Order>> {
    return apiRequest<Order>(`/api/orders/by-ref/${encodeURIComponent(ref)}`, { method: "GET" });
  },
};
