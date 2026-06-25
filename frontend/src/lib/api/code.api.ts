import { apiRequest, ApiResponse } from "./client";

export type CodeCountsResponse = {
  active: number;
  total: number;
};

export const codeApi = {
  getCounts(serviceId: string): Promise<ApiResponse<CodeCountsResponse>> {
    return apiRequest<CodeCountsResponse>(`/api/services/${serviceId}/codes/counts`);
  },

  // You can add more later as needed
  listCodes(serviceId: string): Promise<ApiResponse<{ codes: any[] }>> {
    return apiRequest<{ codes: any[] }>(`/api/services/${serviceId}/codes`);
  },
};