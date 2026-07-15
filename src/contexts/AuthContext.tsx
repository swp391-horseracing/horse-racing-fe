/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { AuthService } from "../services/AuthService";
import { UserService } from "../services/UserService";
import type { UserProfile } from "../types/user";

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string,
    captchaToken: string
  ) => Promise<unknown>;
  register: (
    fullName: string,
    email: string,
    password: string,
    role: string,
    captchaToken: string
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function clearStoredAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("user");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const clearAuth = useCallback(() => {
    clearStoredAuth();
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const existingToken = localStorage.getItem("token");
    if (!existingToken) {
      queueMicrotask(() => setLoading(false));
      return;
    }

    UserService.getProfile()
      .then((profile) => {
        setUser(profile);
        setToken(existingToken);
        localStorage.setItem("userId", profile.id);
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: profile.id,
            role: profile.role,
            full_name: profile.full_name,
          })
        );
      })
      .catch(() => {
        clearAuth();
      })
      .finally(() => {
        setLoading(false);
      });
  }, [clearAuth]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "token") {
        if (e.newValue) {
          window.location.reload();
        } else {
          clearAuth();
        }
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [clearAuth]);

  const login = async (
    email: string,
    password: string,
    captchaToken: string
  ) => {
    const res = await AuthService.login(email, password, captchaToken);
    const jwt = res.token;
    if (jwt) {
      localStorage.setItem("token", jwt);
      setToken(jwt);
      const profile = await UserService.getProfile();
      setUser(profile);
      localStorage.setItem("userId", profile.id);
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: profile.id,
          role: profile.role,
          full_name: profile.full_name,
        })
      );
    }
    return res;
  };

  const register = async (
    fullName: string,
    email: string,
    password: string,
    role: string,
    captchaToken: string
  ) => {
    await AuthService.register(fullName, email, password, role, captchaToken);
  };

  const logout = async () => {
    try {
      await AuthService.logout();
    } catch {
      // ignore
    }
    clearAuth();
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}
