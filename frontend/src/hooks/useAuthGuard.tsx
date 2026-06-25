import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/lib/api/";

export const useAuthGuard = () => {
  return useQuery({
    queryKey: ["auth", "user"],
    queryFn: authApi.getUserRole,
    retry: false,
  });
};