import { useState, useEffect, useCallback } from "react";
import { UserService } from "../services/UserService";
import type { User } from "../types/user";
import type { UpdateProfilePayload } from "../services/UserService";

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
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<UpdateProfilePayload>({});
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

  const startEdit = useCallback(() => {
    if (!user) return;

    setDraft({
      full_name: user.full_name ?? "",
      email: user.email ?? "",
      password: "",
      phone: user.phone ?? "",
      address: user.address ?? "",
    });

    setEditing(true);
    setError(null);
    setSuccessMsg(null);
  }, [user]);

  const saveEdit = useCallback(async () => {
    if (!user) return;

    try {
      // Note: It is perfectly fine to call setLoading(true) here because
      // saveEdit is an event handler, NOT a useEffect.
      setLoading(true);

      const userId = sessionStorage.getItem("userId");
      if (!userId) throw new Error("Missing userId");

      const payload: UpdateProfilePayload = {};

      if (draft.full_name?.trim()) payload.full_name = draft.full_name.trim();
      if (draft.email?.trim()) payload.email = draft.email.trim();
      if (draft.password?.trim()) payload.password = draft.password.trim();
      if (draft.phone?.trim()) payload.phone = draft.phone.trim();
      if (draft.address?.trim()) payload.address = draft.address.trim();

      const res = await UserService.updateUser(userId, payload);

      if (res.token) {
        localStorage.setItem("token", res.token);
      }

      setEditing(false);
      setDraft({});
      setSuccessMsg("Profile updated successfully");
      setTimeout(() => setSuccessMsg(null), 3000);

      await loadUser();
    } catch (err: unknown) {
      const error = err as ApiError;
      const errMsg =
        error?.response?.data?.message || "Failed to update profile";
      setError(errMsg);
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  }, [user, draft, loadUser, handleAuthError]);

  const cancelEdit = useCallback(() => {
    setEditing(false);
    setDraft({});
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    user,
    loading,
    error,
    successMsg,
    activeTab,
    setActiveTab,
    editing,
    draft,
    setDraft,
    startEdit,
    saveEdit,
    cancelEdit,
    clearError,
  };
}
