export type HorseTimelinePoint = {
  time: number;
  distance: number;
};

export type HorseData = {
  id: string;
  name: string;
  timeline: HorseTimelinePoint[];
};

export type HorseState = HorseData & {
  currentDistance: number;
  rank: number;
  rankChange: number;
  speed: number;
  finished: boolean;
  laneIndex: number;
  color: string;
};
