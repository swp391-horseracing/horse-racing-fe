const fs = require("fs");
const crypto = require("crypto");

// --- Configuration ---
const DURATION_MS = 80000;
const TICK_STEP_MS = 200;
const RACE_DISTANCE_M = 600;
const VIOLATION_CHANCE = 0.1;

// --- Horse Profiles (Tuned for High Volatility) ---
// rhythmSpeed: How fast their internal sprint/rest cycle is (lower = more erratic)
// volatility: Randomness factor in speed calculation (0-1)
const profiles = [
  {
    name: "Thunder",
    baseSpeed: 7.8,
    stamina: 95,
    aggression: 0.6,
    rhythmSpeed: 0.8,
    volatility: 0.15,
  },
  {
    name: "Storm",
    baseSpeed: 8.2,
    stamina: 88,
    aggression: 0.8,
    rhythmSpeed: 1.2,
    volatility: 0.25,
  }, // Very erratic
  {
    name: "Lightning",
    baseSpeed: 8.5,
    stamina: 92,
    aggression: 0.7,
    rhythmSpeed: 0.5,
    volatility: 0.1,
  }, // Smooth but fast
  {
    name: "Blaze",
    baseSpeed: 7.5,
    stamina: 98,
    aggression: 0.4,
    rhythmSpeed: 1.5,
    volatility: 0.2,
  }, // Slow cycles, high variance
  {
    name: "Shadow",
    baseSpeed: 7.2,
    stamina: 100,
    aggression: 0.3,
    rhythmSpeed: 0.3,
    volatility: 0.05,
  }, // Consistent plodder
  {
    name: "Comet",
    baseSpeed: 8.8,
    stamina: 85,
    aggression: 0.9,
    rhythmSpeed: 2.0,
    volatility: 0.3,
  }, // Extreme chaos
  {
    name: "Rocket",
    baseSpeed: 9.0,
    stamina: 80,
    aggression: 1.0,
    rhythmSpeed: 1.0,
    volatility: 0.2,
  }, // Fast burnout risk
  {
    name: "Flash",
    baseSpeed: 7.0,
    stamina: 105,
    aggression: 0.2,
    rhythmSpeed: 0.6,
    volatility: 0.12,
  }, // Steady endurance
];

// --- Seeded Random ---
class SeededRandom {
  constructor(seed) {
    this.seed = seed;
  }
  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  range(min, max) {
    return min + this.next() * (max - min);
  }
  gaussian(mean, stdDev) {
    let u = 0,
      v = 0;
    while (u === 0) u = this.next();
    while (v === 0) v = this.next();
    return (
      mean +
      stdDev * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
    );
  }
}

const rng = new SeededRandom(42); // Fixed seed for reproducible chaos

// --- Simulation State ---
const horses = profiles.map((p, index) => ({
  id: crypto.randomUUID(),
  name: p.name,
  laneIndex: index + 1,
  baseSpeed: p.baseSpeed,
  maxStamina: p.stamina,
  currentStamina: p.stamina,
  aggression: p.aggression,
  rhythmSpeed: p.rhythmSpeed,
  volatility: p.volatility,
  position: 0,
  speed: 0,
  finished: false,
  dnf: false,
  violation: rng.next() < VIOLATION_CHANCE,
  phaseOffset: rng.range(0, Math.PI * 2), // Unique starting point in rhythm cycle
}));

const ticks = [];
const totalTicks = Math.ceil(DURATION_MS / TICK_STEP_MS);

console.log(
  `🏇 Starting HIGH-VOLATILITY simulation for ${horses.length} horses...`
);

for (let tickIndex = 0; tickIndex <= totalTicks; tickIndex++) {
  const elapsedMs = tickIndex * TICK_STEP_MS;
  const progress = elapsedMs / DURATION_MS;
  const dt = TICK_STEP_MS / 1000;

  // Sort by position to calculate pack dynamics
  const sortedByPos = [...horses].sort((a, b) => b.position - a.position);

  const horseStates = horses.map((horse) => {
    if (horse.finished || horse.dnf) {
      return {
        horseId: horse.id,
        name: horse.name,
        positionM: Number(horse.position.toFixed(2)),
        progressPct: Number(
          ((horse.position / RACE_DISTANCE_M) * 100).toFixed(2)
        ),
        speedMs: 0,
        finished: true,
      };
    }

    // Violation Check
    if (horse.violation && elapsedMs > rng.range(500, 2000)) {
      horse.dnf = true;
      horse.speed = 0;
      return {
        horseId: horse.id,
        name: horse.name,
        positionM: Number(horse.position.toFixed(2)),
        progressPct: Number(
          ((horse.position / RACE_DISTANCE_M) * 100).toFixed(2)
        ),
        speedMs: 0,
        finished: true,
      };
    }

    // --- 1. Rhythm Cycle (Sine Wave Variation) ---
    // Creates natural surges and slowdowns unique to each horse
    const cycle = Math.sin(
      progress * 10 * horse.rhythmSpeed + horse.phaseOffset
    );
    const rhythmFactor = 1 + cycle * 0.12; // ±12% speed variation from rhythm alone

    // --- 2. Pack Dynamics (Drafting & Wind Resistance) ---
    const rank = sortedByPos.findIndex((h) => h.id === horse.id);
    let packFactor = 1.0;

    if (rank === 0) {
      // Leader faces full wind resistance
      packFactor = 0.96;
    } else if (rank <= 2) {
      // Top 3 get slight drafting benefit from leader
      const distToLeader = sortedByPos[0].position - horse.position;
      if (distToLeader < 15) packFactor = 1.03; // Close drafting bonus
    } else {
      // Mid-pack gets moderate drafting
      packFactor = 1.01;
    }

    // --- 3. Stamina & Fatigue (Non-linear) ---
    const staminaRatio = horse.currentStamina / horse.maxStamina;
    let fatigueFactor = 1.0;

    if (staminaRatio < 0.4) {
      // Exponential decay when tired
      fatigueFactor = Math.pow(staminaRatio / 0.4, 1.5);
    }

    // Random stamina drain spikes ("bad stride")
    if (rng.next() < 0.02) {
      horse.currentStamina -= rng.range(1, 3);
    }

    // --- 4. Late Race Chaos (Aggressive Surges + Burnout Risk) ---
    let surgeFactor = 1.0;
    if (progress > 0.75 && !horse.finished) {
      const surgeChance =
        horse.aggression * staminaRatio * (progress - 0.75) * 4;

      if (rng.next() < surgeChance) {
        // SURGE! But check for burnout
        if (staminaRatio > 0.2) {
          surgeFactor = rng.range(1.1, 1.25); // Variable surge intensity
          horse.currentStamina -= rng.range(1.5, 4); // Heavy cost
        } else {
          // BURNOUT: Tried to surge but too tired -> massive slowdown
          fatigueFactor *= 0.6;
        }
      }
    }

    // --- 5. Gaussian Noise (Organic Jitter) ---
    const noise = rng.gaussian(1.0, horse.volatility);
    const jitterFactor = Math.max(0.85, Math.min(1.15, noise)); // Clamp extreme outliers

    // --- Final Speed Calculation ---
    const accelPhase = Math.min(1, progress / 0.12);
    const baseAccel = 0.5 + 0.5 * accelPhase;

    horse.speed =
      horse.baseSpeed *
      baseAccel *
      rhythmFactor *
      packFactor *
      fatigueFactor *
      surgeFactor *
      jitterFactor;

    // Update Position & Stamina
    horse.position += horse.speed * dt;
    horse.currentStamina = Math.max(
      0,
      horse.currentStamina - 0.04 * (horse.speed / horse.baseSpeed)
    );

    // Finish Check
    if (horse.position >= RACE_DISTANCE_M) {
      horse.position = RACE_DISTANCE_M;
      horse.finished = true;
      horse.speed = 0;
    }

    return {
      horseId: horse.id,
      name: horse.name,
      positionM: Number(horse.position.toFixed(2)),
      progressPct: Number(
        ((horse.position / RACE_DISTANCE_M) * 100).toFixed(2)
      ),
      speedMs: Number(horse.speed.toFixed(2)),
      finished: horse.finished,
    };
  });

  ticks.push({
    type: "race:tick",
    data: {
      raceId: "volatile-race-" + Date.now(),
      tick: { tickIndex, elapsedMs, horses: horseStates },
    },
  });
}

// --- Output ---
let tsContent = `import type { RaceTickEvent } from "../types/live.ts";\n\nexport const mockTicks: RaceTickEvent[] = ${JSON.stringify(ticks, null, 2)};\n`;
tsContent = tsContent.replace(/"(\w+)":/g, "$1:");
fs.writeFileSync("./src/test/mockReplay.ts", tsContent);

console.log(`✅ Generated ${ticks.length} high-volatility ticks.`);
console.log(`📁 Saved to ./src/test/mockReplay.ts`);
