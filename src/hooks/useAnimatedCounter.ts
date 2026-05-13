import { useState, useEffect, useRef } from "react";

export const useAnimatedCounter = (
  endValue: string,
  duration: number = 1500,
  delay: number = 0
) => {
  const [displayValue, setDisplayValue] = useState(endValue);
  const previousEndValue = useRef<string>(endValue);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // On first render, just show the value without animation
    if (isFirstRender.current) {
      isFirstRender.current = false;
      setDisplayValue(endValue);
      previousEndValue.current = endValue;
      return;
    }

    // If value hasn't changed, don't animate
    if (previousEndValue.current === endValue) {
      return;
    }

    // Extract numeric value and format info
    const hasPrefix = endValue.startsWith("R$");
    const hasSuffix = endValue.endsWith("%");
    const hasK = endValue.includes("K");
    
    // Clean the value to get just the number
    const cleanValue = endValue
      .replace("R$", "")
      .replace("%", "")
      .replace("K", "")
      .replace(/\./g, "")
      .replace(",", ".")
      .trim();
    
    const targetNumber = parseFloat(cleanValue) || 0;
    
    // Get the previous number for smooth transition
    const prevCleanValue = previousEndValue.current
      .replace("R$", "")
      .replace("%", "")
      .replace("K", "")
      .replace(/\./g, "")
      .replace(",", ".")
      .trim();
    
    const startNumber = parseFloat(prevCleanValue) || 0;
    
    previousEndValue.current = endValue;

    // Start animation after delay
    const delayTimeout = setTimeout(() => {
      const startTime = Date.now();

      const animate = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutExpo = 1 - Math.pow(2, -10 * progress);
        const currentNumber = startNumber + (targetNumber - startNumber) * easeOutExpo;

        // Format the number back to the original format
        let formatted: string;
        
        if (hasSuffix) {
          formatted = currentNumber.toFixed(1).replace(".", ",") + "%";
        } else if (hasPrefix && hasK) {
          // Format with K suffix
          formatted = "R$ " + currentNumber.toFixed(1).replace(".", ",") + "K";
        } else if (hasPrefix) {
          // Format as Brazilian currency
          const rounded = Math.round(currentNumber);
          formatted = "R$ " + rounded.toLocaleString("pt-BR");
        } else if (hasK) {
          // Format with K suffix
          formatted = currentNumber.toFixed(1).replace(".", ",") + "K";
        } else {
          // Format as integer with dots
          formatted = Math.round(currentNumber).toLocaleString("pt-BR");
        }

        setDisplayValue(formatted);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Ensure final value matches exactly
          setDisplayValue(endValue);
        }
      };

      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(delayTimeout);
  }, [endValue, duration, delay]);

  return displayValue;
};
