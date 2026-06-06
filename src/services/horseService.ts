import type { Horse } from "../types/horse.ts";

// const MOCK = true;

const mockList: Horse[] = [
  {
    id: "1",
    name: "Thunder Bolt",
    breed: "Arabian",
    age: 5,
    gender: "Male",
    speed: 108,
    stamina: 88,
    owner: "John Smith",
    jockey: "Michael Lee",
    status: "Active",
    earnings: 1003,
    winRate: 0.25,
  },

  {
    id: "2",
    name: "Silver Storm",
    breed: "Thoroughbred",
    age: 4,
    gender: "Female",
    speed: 112,
    stamina: 91,
    owner: "Emma Watson",
    jockey: "David Kim",
    status: "Training",
    earnings: 1234,
    winRate: 0.3,
  },

  {
    id: "3",
    name: "Dark Phantom",
    breed: "Mustang",
    age: 6,
    gender: "Male",
    speed: 116,
    stamina: 85,
    owner: "Robert Brown",
    jockey: "Chris Evans",
    status: "Injured",
    earnings: 2000,
    winRate: 0.4,
  },
];

export const HorseService = {
  getHorses: async (): Promise<Horse[]> => {
    return mockList;
  },

  getHorsesByEarnings: async (): Promise<Horse[]> => {
    const rankings = [...mockList].sort((a, b) => b.earnings - a.earnings);
    return rankings;
  },

  getHorseById: async (id: string): Promise<Horse | undefined> => {
    return mockList.find((horse) => horse.id === id);
  },

  createHorse: async (horse: Horse): Promise<Horse> => {
    mockList.push(horse);
    return horse;
  },

  updateHorse: async (
    id: string,
    updatedHorse: Horse
  ): Promise<Horse | undefined> => {
    const index = mockList.findIndex((horse) => horse.id === id);

    if (index === -1) {
      return undefined;
    }

    mockList[index] = updatedHorse;

    return updatedHorse;
  },

  deleteHorse: async (id: string): Promise<boolean> => {
    const index = mockList.findIndex((horse) => horse.id === id);

    if (index === -1) {
      return false;
    }

    mockList.splice(index, 1);

    return true;
  },
};
