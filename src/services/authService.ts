import api from "../lib/api.ts";
import type { User } from "../types/user.ts";

export const AuthService = {
  login: async (email: string, password: string): Promise<User> => {
    const response = await api.post("/auth/login", {
      email,
      password,
    });
    return response.data;
  },

  register: async (
    fullName: string,
    email: string,
    password: string,
    role: string
  ): Promise<User> => {
    const response = await api.post("/auth/register", {
      fullName,
      email,
      password,
      role,
    });
    return response.data;
  },
};
