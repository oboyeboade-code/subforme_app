import React, { useState, useEffect } from "react";
import { mutate } from "swr"; // SWR's global mutate
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { X, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { userApi } from "@/lib/api/";

interface VersionSwitcherBannerProps {
  currentVersion: "v3" | "editorial";
}

const VersionSwitcherBanner = ({ currentVersion }: VersionSwitcherBannerProps) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient(); // <-- add this

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // 1. Check if dismissed in this session
        const isDismissed = sessionStorage.getItem(`version_banner_dismissed_${currentVersion}`) === "true";
        if (isDismissed) return;

        // 2. Fetch profile directly from API to check current preference
        const res = await userApi.getProfile();
        const userVersion = res.data.uiVersion;

        // 3. Show banner only if they are on editorial and haven't chosen v3 yet
        if (currentVersion === "editorial" && userVersion !== "v3") {
          setIsVisible(true);
        }
      } catch (err) {
        // If API fails (e.g. not logged in), we stay silent
        console.error("Banner status check failed", err);
      }
    };

    checkStatus();
  }, [currentVersion]);

// testing
// useEffect(() => {
//   const dismissed =
//     sessionStorage.getItem(`version_banner_dismissed_${currentVersion}`) === "true";
//   if (dismissed || currentVersion === "v3") return;

//   setIsVisible(true);
//   const t = setTimeout(() => setIsVisible(false), 30000);
//   return () => clearTimeout(t);
// }, [currentVersion]);


  const handleSwitchVersion = async () => {
    setIsUpdating(true);
    try {
      // Update the preference directly via API
      const res = await userApi.updateProfile({ uiVersion: "v3" });

      // Option 1: Set cache directly with response data - instant update
      queryClient.setQueryData(["profile"], res.data);

      // 2. Update SWR cache - replace "SWR_KEY_HERE" with your actual key
      mutate("profile", res.data, false); // false = don't revalidate

      // Navigate to the modern version
      navigate("/v3/app");
      setIsVisible(false);
    } catch (err) {
      console.error("Failed to update version preference", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem(`version_banner_dismissed_${currentVersion}`, "true");
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 px-4 py-3 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top duration-500">
      <div className="flex items-center gap-3 flex-1">
        <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0" />
        <p className="text-sm text-slate-700">
          <span className="font-medium">Try our new Modern dashboard</span> for a faster, more intuitive experience.
        </p>
      </div>
      
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button
          onClick={handleSwitchVersion}
          size="sm"
          disabled={isUpdating}
          className="bg-blue-600 hover:bg-blue-700 text-white min-w-[100px]"
        >
          {isUpdating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Switch Now"
          )}
        </Button>
        <button
          onClick={handleDismiss}
          className="p-1 hover:bg-blue-100 rounded transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4 text-slate-500" />
        </button>
      </div>
    </div>
  );
};

export default VersionSwitcherBanner;
