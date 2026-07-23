export interface Jockey {
  id: string | number;
  name: string;
  fullName: string;
  avatarUrl?: string | null;
  weightKg?: number | null;
  experienceYear?: number | null;
  isRacing?: boolean;
  licenseId?: string;
  winRate: number;
  totalRuns: number;
  podiums: number;
  club: string;
  createdAt?: string;
}
