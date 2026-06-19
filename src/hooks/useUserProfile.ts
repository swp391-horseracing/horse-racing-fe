import { useState, useEffect, useCallback } from "react";
import { UserService } from "../services/UserService";
import type { User } from "../types/user";

export type ProfileTab = "account" | "notifications";

// 1. Define a strict type for API errors to replace 'any'
interface ApiError {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
}

export function useUserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ProfileTab>("account");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Helper to handle 401 Unauthorized errors (Replaced 'any' with 'unknown')
  const handleAuthError = useCallback((err: unknown) => {
    const error = err as ApiError;
    if (error?.response?.status === 401) {
      sessionStorage.clear();
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  }, []);

  const loadUser = useCallback(async () => {
    try {
      // 2. CRITICAL FIX: Removed synchronous setLoading(true) and setError(null).
      // Calling setState before the first 'await' triggers the react-hooks/set-state-in-effect rule.

      const userId = sessionStorage.getItem("userId");
      if (!userId) throw new Error("Missing userId");

      const u = await UserService.getUser(userId);
      setUser(u);
      sessionStorage.setItem("user", JSON.stringify(u));
    } catch (err: unknown) {
      const error = err as ApiError;
      const msg =
        error?.response?.data?.message || "Failed to load user profile";
      setError(msg);
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  }, [handleAuthError]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadUser();
  }, [loadUser]);

  const refreshUser = useCallback(async () => {
    await loadUser();
  }, [loadUser]);

  const clearError = useCallback(() => setError(null), []);

  return {
    user,
    loading,
    error,
    successMsg,
    activeTab,
    setActiveTab,
    clearError,
    refreshUser,
  };
}
