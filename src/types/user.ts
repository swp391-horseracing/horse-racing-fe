export type User = {
  id: string;
  email: string;
  password: string;
  fullName: string;
  phone: string;
  address: string;
  avatar_url: string;
  role: string;
  status: string;
  token: string;
  extendedProps?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type ExtendedProps = {
  email: string;
};

export type jockey = {
  id: string;
  user_id: string;
  weight: number;
  license_number: string;
  experience: string;
};
