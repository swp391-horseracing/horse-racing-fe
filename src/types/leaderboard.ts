import type { Horse } from "./horse";

export type LeaderboardRow = {
  rank: number;
  horse: Horse;
};

export type LeaderboardData = {
  updatedAt: string;
  rows: LeaderboardRow[];
};