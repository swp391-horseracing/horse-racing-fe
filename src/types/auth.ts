import type { User } from "./user";

export interface LoginResponse {
  email: string;
  password: string;
  captchaToken: string;
  token: string;
  user: User;
}
