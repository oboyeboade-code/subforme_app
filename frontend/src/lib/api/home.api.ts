import { apiRequest, ApiResponse } from "./client";

/**
 * TopProvider - matches backend shape exactly
 * UI-only fields like name, tag, initials, hue should be computed in component
 */
export interface TopProvider {
  id: string;
  providerName: string;
  services: string[]; // Names of services that contributed to ranking
  logoUrl?: string;
}

/**
 * Platform metrics from backend
 */
export interface IPlatformMetric {
  weekIdentifier: string;
  topProviders: TopProvider[];
  mostOrderedServices: string[];
  totalRevenue: number;
  activeUsersCount: number;
  systemHealthStatus: "healthy" | "degraded" | "down";

  metadata?: {
    totalBookings?: number;
    detailedServices?: {
      id: string;
      name: string;
      totalOrders: number;
    }[];
    [key: string]: any;
  };

  createdAt?: string;
  updatedAt?: string;
}

/**
 * Categories
 */
export interface AppCategory {
  name: string;
  iconName?: string;
}

export const homeApi = {
  getTopProviders(): Promise<ApiResponse<TopProvider[]>> {
    return apiRequest<TopProvider[]>("/api/home/top-providers");
  },

  getCategories(): Promise<ApiResponse<AppCategory[]>> {
    return apiRequest<AppCategory[]>("/api/home/categories");
  },

  getPlatformMetrics(): Promise<ApiResponse<IPlatformMetric>> {
    return apiRequest<IPlatformMetric>("/api/home/platform-metrics");
  },
};