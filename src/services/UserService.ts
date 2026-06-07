import api from "../lib/api";

export type UpdateProfilePayload = {
  full_name?: string;
  email?: string;
  password?: string;
  phone?: string;
  address?: string;
  avatar?: string; // Changed to 'avatar' to match your screenshot body
};

export type UpdateProfileResponse = {
  message: string;
  user: {
    id: string;
    full_name: string;
    email: string;
    role: string;
    status: string;
  };
  token?: string;
};

export const UserService = {
  getUser: async (id: string) => {
    const response = await api.get(`/profiles/${id}`);
    return response.data;
  },

  updateUser: async (
    id: string,
    payload: UpdateProfilePayload
  ): Promise<UpdateProfileResponse> => {
    const response = await api.patch(`/profiles/${id}`, payload);
    return response.data;
  },

  logout: (): void => {
    localStorage.removeItem("token");
  },
};
