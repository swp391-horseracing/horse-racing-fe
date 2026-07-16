import { useAuthContext } from "../../contexts/AuthContext";
import { UserService } from "../../services/UserService";

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
  const {
    token,
    login: ctxLogin,
    logout: ctxLogout,
    register: ctxRegister,
  } = useAuthContext();

  const getToken = (): string | null => {
    return localStorage.getItem("token");
  };

  const login = async (
    email: string,
    password: string,
    captchaToken: string
  ) => {
    try {
      return await ctxLogin(email, password, captchaToken);
    } catch (error) {
      resetCaptcha();
      throw error;
    }
  };

  const register = async (
    fullName: string,
    email: string,
    password: string,
    role: string,
    captchaToken: string
  ) => {
    try {
      await ctxRegister(fullName, email, password, role, captchaToken);
    } catch (error) {
      resetCaptcha();
      throw error;
    }
  };

  const logout = async () => {
    await ctxLogout();
  };

  const getUserByID = async (id: string) => {
    return UserService.getUser(id);
  };

  const resetCaptcha = () => {
    if (typeof window !== "undefined" && window.grecaptcha) {
      window.grecaptcha.reset();
    }
  };

  return { token, login, logout, register, getToken, getUserByID };
}
