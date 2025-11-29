// src/hooks/useEntropy.ts
import { useState, useEffect } from 'react';
import { Gyroscope } from 'expo-sensors';
import * as Battery from 'expo-battery';

interface EntropyResult {
  seed: number | null;
  loading: boolean;
  error: string | null;
  getSeed: () => Promise<number | null>;
}

export const useEntropy = (): EntropyResult => {
  const [seed, setSeed] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getSeed = async () => {
    setLoading(true);
    setError(null);
    try {

      // Note: Battery permission is not required - battery level is accessible without permissions

      // Get battery level
      const batteryLevel = await Battery.getBatteryLevelAsync();
      const time = Date.now();

      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Remove the listener
      const chaos = Math.abs((batteryLevel * 1000) + time);
      const generatedSeed = Math.floor(chaos);
      setSeed(generatedSeed);
      return generatedSeed;
    } catch (e: any) {
      console.error("Error getting entropy seed:", e);
      setError(e.message || "Failed to generate entropy seed.");
      setSeed(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { seed, loading, error, getSeed };
};
