import type { User } from "../types/user.ts";

const mockUser: User = {
  id: "u_001",
  email: "j.thorne@eliteturf.com",
  password: "hashed_password",
  fullName: "Julian Thorne",
  phone: "+44 7700 900 123",
  address: "12 Newmarket Road, Suffolk",
  avatar_url: "https://example.com/avatar.jpg",
    token: "1",
  role: "Spectator",
  status: "ACTIVE",
  created_at: "2025-01-15T10:00:00Z",
  updated_at: "2026-06-01T12:00:00Z",
};

export const UserService = {
  getUser: (): Promise<User> => Promise.resolve({ ...mockUser }),

  updateUser: (patch: Partial<User>): Promise<User> =>
    Promise.resolve({
      ...mockUser,
      ...patch,
      updated_at: new Date().toISOString(),
    }),

  updateStatus: (status: string): Promise<User> =>
    Promise.resolve({
      ...mockUser,
      status,
      updated_at: new Date().toISOString(),
    }),

  updateRoles: (roles: string[]): Promise<User> =>
    Promise.resolve({
      ...mockUser,
      roles,
      updated_at: new Date().toISOString(),
    }),

  updateAvatar: (avatar_url: string): Promise<User> =>
    Promise.resolve({
      ...mockUser,
      avatar_url,
      updated_at: new Date().toISOString(),
    }),

  logout: (): Promise<void> => Promise.resolve(),
};
