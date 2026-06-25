import { apiRequest, ApiResponse } from "./client";
import { type AdminService } from "./admin.api";

export interface IService {
  _id: string;
  vendorBusinessId: { businessName: string };
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

export type UserRef =
  | string
  | {
      _id: string;
      email: string;
    };

export interface IServiceCode {
  _id: string;
  userId: UserRef;
  vendorBusinessId: string;
  serviceId: string;
  orderId?: string;
  auth_code: string;
  serv_code: string;
  purchasePrice?: number;
  status: "active" | "used" | "expired" | "voided";
  issuedAt: string;
  expiresAt?: string;
  redeemedAt?: string;
  redeemedBy?: string;
  isVoided?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type Service = IService;

export type ServiceCode = IServiceCode;

// export type AdminService = IService & {
//   activeCodeCount: number;
//   totalCodeCount: number;
// };

export const serviceApi = {
  // From customer.api.ts
  listServices(): Promise<ApiResponse<{ services: Service[] }>> {
    return apiRequest<{ services: Service[] }>("/api/services");
  },

  // From customer.api.ts (subscriptions are essentially service codes tied to a user)
  getSubscriptions(): Promise<ApiResponse<{ subscriptions: ServiceCode[] }>> {
    return apiRequest<{ subscriptions: ServiceCode[] }>("/api/subscriptions");
  },

  // From admin.api.ts
  getAllServicesAdmin(): Promise<ApiResponse<AdminService[]>> {
    return apiRequest<AdminService[]>("/api/admin/services");
  },

  createService(payload: Partial<IService>): Promise<ApiResponse<Service>> {
    return apiRequest<Service>("/api/admin/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },

  updateService(id: string, payload: Partial<IService>): Promise<ApiResponse<Service>> {
    return apiRequest<Service>(`/api/admin/services/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },

  deleteService(id: string): Promise<ApiResponse<void>> {
    return apiRequest<void>(`/api/admin/services/${id}`, {
      method: "DELETE",
    });
  },

  // From admin.api.ts (getCodes, refreshCodes)
  getServiceCodes(): Promise<ApiResponse<ServiceCode[]>> {
    return apiRequest<ServiceCode[]>("/api/admin/codes");
  },

  refreshServiceCodes(): Promise<ApiResponse<void>> {
    return apiRequest<void>("/api/admin/codes/refresh", {
      method: "POST",
    });
  },
};
