export interface Horse {
  id: string;

  name: string;
  breed: string;
  age: number;
  gender: "Male" | "Female";
  speed: number;
  stamina: number;
  owner: string;
  jockey: string;
  status: "Active" | "Training" | "Injured" | "Retired";
  earnings: number;
  winRate: number; // Optional, can be calculated from performance data
  image?: string;
}
