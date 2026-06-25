import { apiRequest, ApiResponse } from "./client";

export interface IBooking {
  _id: string;
  userId: string;
  vendorId: string;
  serviceId: string;
  orderId?: string;
  serviceCodeIds?: string[];
  quantity?: number;
  totalPriceNaira?: number;
  status: "pending" | "confirmed" | "cancelled" | "no_show" | "completed";
  bookedAt: string;
  createdAt: string;
  updatedAt: string;
}

export type Booking = IBooking;

export const bookingApi = {
  createBooking(payload: Partial<IBooking>): Promise<ApiResponse<Booking>> {
    return apiRequest<Booking>("/api/booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },

  getMyBookings(): Promise<ApiResponse<Booking[]>> {
    return apiRequest<Booking[]>("/api/booking/me");
  },

  confirmBooking(id: string): Promise<ApiResponse<Booking>> {
    return apiRequest<Booking>(`/api/booking/${id}/confirm`, {
      method: "PATCH",
    });
  },

  completeBooking(id: string): Promise<ApiResponse<Booking>> {
    return apiRequest<Booking>(`/api/booking/${id}/complete`, {
      method: "PATCH",
    });
  },

  cancelBooking(id: string): Promise<ApiResponse<Booking>> {
    return apiRequest<Booking>(`/api/booking/${id}/cancel`, {
      method: "PATCH",
    });
  },
};
