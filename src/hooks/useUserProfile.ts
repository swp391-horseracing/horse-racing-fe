import { useState, useEffect, useCallback } from "react";
import { UserService } from "../services/UserService";
import type { User } from "../types/user";
import { useAuthContext } from "../contexts/AuthContext";

export type ProfileTab = "account" | "notifications";

interface ApiError {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
}

export function useUserProfile() {
  const { token } = useAuthContext();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ProfileTab>("account");
  const [error, setError] = useState<string | null>(null);

  const handleAuthError = useCallback((err: unknown, setErrorFn?: (msg: string) => void) => {
    const error = err as ApiError;
    if (error?.response?.status === 401) {
      const msg = error?.response?.data?.message || "Session expired. Please log in again.";
      if (setErrorFn) setErrorFn(msg);
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("user");
    }
  }, []);

  const loadUser = useCallback(async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) throw new Error("Missing userId");

      const u = await UserService.getUser(userId);
      setUser(u);
      localStorage.setItem(
        "user",
        JSON.stringify({ id: u.id, role: u.role, full_name: u.full_name })
      );
    } catch (err: unknown) {
      const error = err as ApiError;
      const msg =
        error?.response?.data?.message || "Failed to load user profile";
      setError(msg);
      handleAuthError(err, setError);
    } finally {
      setLoading(false);
    }
  }, [handleAuthError]);

  useEffect(() => {
    if (!token) {
      queueMicrotask(() => setLoading(false));
      return;
    }
    queueMicrotask(() => {
      void loadUser();
    });
  }, [token, loadUser]);

  const refreshUser = useCallback(async () => {
    await loadUser();
  }, [loadUser]);

  const clearError = useCallback(() => setError(null), []);

  return {
    user,
    loading,
    error,

    activeTab,
    setActiveTab,
    clearError,
    refreshUser,
  };
}
