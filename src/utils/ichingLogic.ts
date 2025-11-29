// src/utils/ichingLogic.ts
import iChingData from 'i-ching/lib/data.json'; // Corrected path to i-ching data

// Extract the hexagrams array from the data structure
const hexagrams = iChingData.hexagrams;

// Basic seeded pseudo-random number generator (LCG)
// Not cryptographically secure, but suitable for deriving hexagrams from a seed.
class SeededRandom {
  private seed: number;
  constructor(seed: number) {
    this.seed = seed % 2147483647; // Ensure seed is within integer range
    if (this.seed <= 0) this.seed += 2147483646;
  }

  next(): number {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646; // Normalize to (0, 1)
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}

// Function to simulate 3 coin tosses for a single line
// Returns 6 (old yin), 7 (young yang), 8 (young yin), 9 (old yang)
const tossCoins = (seededRandom: SeededRandom): number => {
  let sum = 0;
  for (let i = 0; i < 3; i++) {
    sum += seededRandom.nextInt(2, 3); // Simulating 2 or 3 for coin faces
  }
  return sum;
};

// Generates 6 lines for a hexagram based on a seed
export const generateHexagramLines = (seed: number): number[] => {
  const seededRandom = new SeededRandom(seed);
  const lines: number[] = [];
  for (let i = 0; i < 6; i++) {
    lines.push(tossCoins(seededRandom));
  }
  return lines;
};

// Converts 6 lines (6,7,8,9) into a hexagram number (1-64)
// and identifies changing lines.
export interface HexagramReading {
  primaryHexagramNumber: number;
  primaryHexagramLines: number[]; // 0 for yin, 1 for yang
  changingHexagramNumber?: number; // If there are changing lines
  changingHexagramLines?: number[]; // 0 for yin, 1 for yang
  changingLines: number[]; // Indices of changing lines (0-5)
}

export const getHexagramReading = (lines: number[]): HexagramReading => {
  const primaryHexagramLines: number[] = lines.map(line => (line === 6 || line === 8) ? 0 : 1); // 0 = Yin, 1 = Yang
  
  // Calculate primary hexagram number
  // The i-ching package expects binary lines for hexagram lookup
  // 'i-ching' library hexagrams are indexed 1-64
  // The binary representation usually starts from the bottom line
  // Example: 000000 is hexagram 2 (Kun)
  //          111111 is hexagram 1 (Qian)
  const primaryBinary = primaryHexagramLines.join('');
  
  // The i-ching package (from npm) has hexagrams indexed 1-64,
  // mapping to its internal 'binary' representation.
  // We need to map our binary (bottom to top) to its internal structure.
  // The `hexagrams` array in i-ching data is ordered by hexagram number (1-64).
  // Each hexagram object has a 'lines' property which is an array of 0s and 1s (bottom to top).

  let primaryHexagramNumber: number = 0;
  for (let i = 0; i < hexagrams.length; i++) {
    if (hexagrams[i].lines.join('') === primaryBinary) {
      primaryHexagramNumber = hexagrams[i].number;
      break;
    }
  }

  // Identify changing lines
  const changingLines: number[] = [];
  lines.forEach((line, index) => {
    if (line === 6 || line === 9) { // Old Yin (6) or Old Yang (9) are changing lines
      changingLines.push(index);
    }
  });

  let changingHexagramNumber: number | undefined;
  let changingHexagramLines: number[] | undefined;

  if (changingLines.length > 0) {
    changingHexagramLines = primaryHexagramLines.map((line, index) => {
      if (changingLines.includes(index)) {
        return line === 0 ? 1 : 0; // Flip changing lines
      }
      return line;
    });

    const changingBinary = changingHexagramLines.join('');
    for (let i = 0; i < hexagrams.length; i++) {
      if (hexagrams[i].lines.join('') === changingBinary) {
        changingHexagramNumber = hexagrams[i].number;
        break;
      }
    }
  }

  return {
    primaryHexagramNumber,
    primaryHexagramLines,
    changingHexagramNumber,
    changingHexagramLines,
    changingLines,
  };
};

