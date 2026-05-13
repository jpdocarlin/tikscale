import confetti from "canvas-confetti";
import { useCallback, useRef } from "react";

export const useConfetti = () => {
  // Throttle confetti to prevent performance issues
  const lastFireRef = useRef<number>(0);
  const THROTTLE_MS = 2000; // Minimum 2 seconds between confetti

  const fireSaleConfetti = useCallback(() => {
    const now = Date.now();
    if (now - lastFireRef.current < THROTTLE_MS) {
      return; // Skip if fired too recently
    }
    lastFireRef.current = now;

    // Simplified confetti - single burst instead of 5
    const defaults = {
      spread: 100,
      ticks: 60,
      gravity: 0.8,
      decay: 0.94,
      startVelocity: 25,
      colors: ["#00f094", "#00d4aa", "#10b981", "#fbbf24"],
      particleCount: 50, // Reduced from 200
      origin: { x: 0.5, y: 0.7 },
    };

    confetti(defaults);
  }, []);

  const fireSuccessConfetti = useCallback(() => {
    const now = Date.now();
    if (now - lastFireRef.current < THROTTLE_MS) {
      return;
    }
    lastFireRef.current = now;

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#00f094", "#00d4aa", "#10b981"],
    });
  }, []);

  return { fireSaleConfetti, fireSuccessConfetti };
};
