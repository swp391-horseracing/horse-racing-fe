export type RaceTickHorse = {
  horseId: string;
  name: string;
  positionM: number;
  progressPct: number;
  speedMs: number;
  finished: boolean;
};

export type RaceTick = {
  tickIndex: number;
  elapsedMs: number;
  horses: RaceTickHorse[];
};

export type RaceTickEvent = {
  type: "race:tick";
  data: {
    raceId: string;
    tick: RaceTick;
  };
};

export type FeFinalPlacement = {
  horseId: string;
  name: string;
  position: number;
  finishTimeMs: number;
  finishStatus: "placed" | "dnf";
};
