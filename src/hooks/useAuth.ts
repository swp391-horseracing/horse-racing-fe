import { useState } from "react";
import type { User } from "../types/user.ts";
import { AuthService } from "../services/authService.ts";

export default function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    const user = await AuthService.login(email, password);

    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
    return user;
  };

  const register = async (
    fullName: string,
    email: string,
    password: string,
    role: string
  ) => {
    try {
      await AuthService.register(fullName, email, password, role);
    } catch (error) {
      console.log(error);
    }
  };

  const logout = async () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  return { user, login, logout, register };
}
