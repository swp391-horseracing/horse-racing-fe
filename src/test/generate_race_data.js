const fs = require("fs");

const duration = 80000;
const step = 50;
const raceDistance = 600;
const numHorses = 12;

const horseNames = [
  "Thunder",
  "Storm",
  "Lightning",
  "Blaze",
  "Shadow",
  "Comet",
  "Rocket",
  "Flash",
  "Bolt",
  "Sprint",
  "Gale",
  "Zephyr",
];

// Define speed profiles (multiplier for base speed)
// Base speed assumes linear progression to 600m in 80s = 7.5 m/s average
// We'll create realistic curves using sine waves for acceleration/deceleration
const profiles = [
  { name: "Thunder", base: 2.0, accel: 0.2 },
  { name: "Storm", base: 3.05, accel: 1.15 },
  { name: "Lightning", base: 1.1, accel: 0.1 },
  { name: "Blaze", base: 1.95, accel: 0.25 },
  { name: "Shadow", base: 2.9, accel: 0.3 },
  { name: "Comet", base: 4.15, accel: 0.05 },
  { name: "Rocket", base: 1.2, accel: 0.0 },
  { name: "Flash", base: 3.85, accel: 0.35 },
  { name: "Bolt", base: 2.02, accel: 0.18 },
  { name: "Sprint", base: 2.98, accel: 0.22 },
  { name: "Gale", base: 0.92, accel: 3.28 },
  { name: "Zephyr", base: 1.08, accel: 1.12 },
];

function generateTimeline(profile) {
  const timeline = [];
  const totalSteps = duration / step;

  for (let i = 0; i <= totalSteps; i++) {
    const time = i * step;
    const progress = time / duration;

    // Realistic racing curve: slow start, fast middle, steady end
    // Using a combination of linear and sine wave for natural variation
    let distance = raceDistance * progress;

    // Add variation based on profile
    // Early game: slower than linear if high accel, faster if low accel
    // Late game: catch up or maintain
    const variation = Math.sin(progress * Math.PI) * (profile.accel * 50);

    distance +=
      (profile.base - 1) * time * (raceDistance / duration) * 0.1 + variation;

    // Clamp distance between 0 and raceDistance
    distance = Math.max(0, Math.min(raceDistance, distance));

    timeline.push({
      time: time,
      distance: parseFloat(distance.toFixed(2)),
    });
  }
  return timeline;
}

const horses = profiles.map((p, index) => ({
  id: (index + 1).toString(),
  name: p.name,
  timeline: generateTimeline(p),
}));

const replayData = {
  duration: duration,
  raceDistance: raceDistance,
  horses: horses,
};

// Generate TypeScript content
let tsContent = `import type {RaceReplay} from "../types/race.ts";\n\nexport const replay: RaceReplay = ${JSON.stringify(replayData, null, 4)};\n`;

// Fix JSON format to match TypeScript object syntax
tsContent = tsContent.replace(/"(\w+)":/g, "$1:");

fs.writeFileSync("./src/services/mockReplay.ts", tsContent);
console.log("File race_replay.ts generated successfully!");
