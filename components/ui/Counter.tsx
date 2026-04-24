"use client";

import { useState, useEffect } from "react";

interface CounterProps {
  value: number;
  duration?: number;
  className?: string;
}

export function Counter({ value, duration = 1500, className }: CounterProps) {
  const [count, setCount] = useState(Math.floor(value * 0.7)); // Start at 70% of the value

  useEffect(() => {
    let startTime: number | null = null;
    const startValue = Math.floor(value * 0.7);

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Use ease-out expo for a snappy feel
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setCount(Math.floor(startValue + (value - startValue) * easeProgress));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span className={className}>{count}</span>;
}
