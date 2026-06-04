import { useState, useEffect, useCallback } from "react";
import { UserService } from "../services/UserService.ts";
import type { User } from "../types/user.ts";

export type ProfileTab = "account" | "privacy" | "settings" | "notifications";

export function useUserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ProfileTab>("account");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Partial<User>>({});

  useEffect(() => {
    UserService.getUser().then((u) => {
      console.log("user data:", u);
      setUser(u);
      setLoading(false);
    });
  }, []);

  const startEdit = useCallback(() => {
    if (!user) return;
    setDraft({ phone: user.phone, address: user.address, role: user.role });
    setEditing(true);
  }, [user]);

  const saveEdit = useCallback(async () => {
    if (!user) return;
    const updated = await UserService.updateUser(draft);
    setUser(updated);
    setEditing(false);
    setDraft({});
  }, [user, draft]);

  const cancelEdit = useCallback(() => {
    setEditing(false);
    setDraft({});
  }, []);

  // const toggleSetting = useCallback(async (key: "dataEncryption" | "thirdPartySharing") => {
  //     if (!user) return
  //     const updated = await UserService.updateUser({ [key]: !user[key] })
  //     setUser(updated)
  // }, [user])

  const logout = useCallback(async () => {
    await UserService.logout();
  }, []);

  return {
    user,
    loading,
    activeTab,
    setActiveTab,
    editing,
    draft,
    setDraft,
    startEdit,
    saveEdit,
    cancelEdit,
    logout,
  };
}
