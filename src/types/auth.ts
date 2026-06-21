import type { User } from "./user";

export interface LoginResponse {
  token: string;
  user: User;
}
