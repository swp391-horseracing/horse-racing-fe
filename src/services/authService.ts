import api from "../lib/api";
import type { User } from "../types/user";
import type { LoginResponse } from "../types/auth";

export const AuthService = {
  login: async (
    email: string,
    password: string,
    captchaToken: string
  ): Promise<LoginResponse> => {
    const response = await api.post("/auth/login", {
      email,
      password,
      captchaToken,
    });
    return response.data;
  },

  register: async (
    fullName: string,
    email: string,
    password: string,
    role: string,
    captchaToken: string
  ): Promise<User> => {
    const response = await api.post("/auth/register", {
      fullName,
      email,
      password,
      role,
      captchaToken,
    });
    return response.data;
  },

  logout: async (): Promise<void> => {
    const response = await api.post("/auth/logout");
    console.log(response);
  },
};
