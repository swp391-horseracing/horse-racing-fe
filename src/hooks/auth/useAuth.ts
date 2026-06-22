import { useState } from "react";
import { AuthService } from "../../services/AuthService.ts";
import { UserService } from "../../services/UserService.ts";

declare global {
  interface Window {
    grecaptcha?: {
      reset: (widgetId?: number) => void;
      getResponse: (widgetId?: number) => string;
      execute: (widgetId?: number | string, options?: object) => void;
    };
  }
}

export default function useAuth() {
  const [token, setToken] = useState<string | null>(null);

  const resetCaptcha = () => {
    if (typeof window !== "undefined" && window.grecaptcha) {
      window.grecaptcha.reset();
    }
  };

  const login = async (
    email: string,
    password: string,
    captchaToken: string
  ) => {
    try {
      const user = await AuthService.login(email, password, captchaToken);

      const jwt = user.token;
      const userId = user.user.id;

      if (jwt) {
        localStorage.setItem("token", jwt);
        sessionStorage.setItem("userId", userId);
        setToken(jwt);
      }

      return user;
    } catch (error) {
      resetCaptcha();
      throw error;
    }
  };

  const getToken = (): string | null => {
    const token = localStorage.getItem("token");
    if (token === null) {
      return null;
    }
    return token;
  };

  const register = async (
    fullName: string,
    email: string,
    password: string,
    role: string,
    captchaToken: string
  ) => {
    try {
      const user = await AuthService.register(
        fullName,
        email,
        password,
        role,
        captchaToken
      );
      console.log(user);
    } catch (error) {
      resetCaptcha();
      console.log(error);
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error(
        "Backend logout failed, proceeding with client-side cleanup:",
        error
      );
    } finally {
      localStorage.removeItem("token");
      sessionStorage.clear();
      setToken(null);
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  };

  const getUserByID = async (id: string) => {
    const user = await UserService.getUser(id);
    return user;
  };

  return { token, login, logout, register, getToken, getUserByID };
}
