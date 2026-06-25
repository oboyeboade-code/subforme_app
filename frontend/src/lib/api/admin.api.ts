import { apiRequest, ApiResponse } from "./client";
import { IBaseUser, IAdmin } from "./auth.api";

export type ProviderCategory = string

export interface IContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
  userId?: string;
  status: "pending" | "resolved";
  ipAddress?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IListingRequest {
  userId: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  website?: string;
  address?: string;
  serviceName: string;
  category: string;
  pricing: string;
  estCodesPerMonth?: number;
  operatingHours?: string;
  description?: string;
  redemptionInstructions?: string;
  payoutMethod?: string;
  payoutName?: string;
  bankName?: string;
  accountNumber?: string;
  mobileNumber?: string;
  walletAddress?: string;
  platformFee?: number;
  termsAccepted: boolean;
  rejectionReason?: string;
  status: "pending" | "approved" | "rejected";
  reviewedBy?: string;
  reviewedAt?: string;
  uiVersion?: string;
  createdAt: string;
  updatedAt: string;
}

export type AdminOverviewMetrics = {
  providersCount: number;
  servicesCount: number;
  codesCount: number;
  activeProvidersCount: number;
  systemStatus: string;
};

export interface AdminService {
  _id: string;
  vendorBusinessId: { _id: string; businessName: string};
  name: string;
  slug: string;
  description?: string;
  category: string;
  tags?: string[];
  image?: string;
  gallery?: string[];
  unitName?: string;
  priceNaira: number;
  originalPriceNaira?: number;
  discountValue?: number;
  minQuantity?: number;
  maxQuantity?: number;
  terms?: string;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AdminAccount = IAdmin;

export const adminApi = {
  getOverview(): Promise<ApiResponse<AdminOverviewMetrics>> {
    return apiRequest<AdminOverviewMetrics>("/api/admin/overview");
  },

  getSettings(): Promise<ApiResponse<any>> {
    return apiRequest<any>("/api/admin/settings");
  },

  getAdmins(): Promise<ApiResponse<AdminAccount[]>> {
    return apiRequest<AdminAccount[]>("/api/admin/admins");
  },

  createAdmin(payload: Partial<IBaseUser>): Promise<ApiResponse<AdminAccount>> {
    return apiRequest<AdminAccount>("/api/admin/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },

  updateAdmin(id: string, payload: Partial<IBaseUser>): Promise<ApiResponse<AdminAccount>> {
    return apiRequest<AdminAccount>(`/api/admin/admins/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },

  deleteAdmin(id: string): Promise<ApiResponse<void>> {
    return apiRequest<void>(`/api/admin/admins/${id}`, {
      method: "DELETE",
    });
  },

  getContactMessages(): Promise<ApiResponse<IContactMessage[]>> {
    // Assuming this endpoint exists on the backend, even if it was a 'fake' API in the original
    return apiRequest<IContactMessage[]>("/api/admin/contact-messages");
  },

  updateContactMessage(id: string, payload: Partial<IContactMessage>): Promise<ApiResponse<IContactMessage>> {
    // Assuming this endpoint exists on the backend, even if it was a 'fake' API in the original
    return apiRequest<IContactMessage>(`/api/admin/contact-messages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },

  getListingRequests(): Promise<ApiResponse<IListingRequest[]>> {
    // Assuming this endpoint exists on the backend, even if it was a 'fake' API in the original
    return apiRequest<IListingRequest[]>("/api/admin/listing-requests");
  },

  reviewListingRequest(id: string, status: "approved" | "rejected", reviewerNote?: string): Promise<ApiResponse<IListingRequest>> {
    return apiRequest<IListingRequest>(`/api/admin/listing-requests/${id}/review`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, reviewerNote }),
    });
  },
};
