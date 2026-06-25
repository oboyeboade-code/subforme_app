import { authApi } from "@/lib/api/auth.api";
import { toast } from "sonner";
import { queryClient } from "@/lib/queryClient"; // ✅ FIXED
import { mutate } from "swr";

/**
 * Shared helper function to handle logout logic across the application
 */
export const handleLogout = async (
  setIsLoggingOut: (loading: boolean) => void,
  navigate: (path: string, options?: { replace: boolean }) => void,
  useV3Redirect = true
) => {
  setIsLoggingOut(true);

  try {
    await authApi.logout();
    toast.success("Signed out");

    // clear SWR cache
    mutate(() => true, undefined, { revalidate: false });

    // clear React Query cache
    queryClient.clear();
    localStorage.clear();

    navigate(useV3Redirect ? "/v3" : "/", {
      replace: true,
    });
  } catch {
    toast.error("Logout failed. Check connection and try again");
  } finally {
    setIsLoggingOut(false);
  }
};