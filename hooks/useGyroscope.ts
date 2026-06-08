"use client";

import { useEffect, useState } from "react";

export interface GyroTilt {
  beta: number;
  gamma: number;
  supported: boolean;
}

export function useGyroscope(enabled = true) {
  const [tilt, setTilt] = useState<GyroTilt>({ beta: 0, gamma: 0, supported: false });

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const onOrient = (e: DeviceOrientationEvent) => {
      setTilt({
        beta: e.beta ?? 0,
        gamma: e.gamma ?? 0,
        supported: true,
      });
    };

    const request = async () => {
      const DO = DeviceOrientationEvent as typeof DeviceOrientationEvent & {
        requestPermission?: () => Promise<string>;
      };
      if (typeof DO.requestPermission === "function") {
        try {
          const perm = await DO.requestPermission();
          if (perm !== "granted") return;
        } catch {
          return;
        }
      }
      window.addEventListener("deviceorientation", onOrient, { passive: true });
      setTilt((t) => ({ ...t, supported: true }));
    };

    if (window.DeviceOrientationEvent) {
      request();
    }

    return () => window.removeEventListener("deviceorientation", onOrient);
  }, [enabled]);

  return tilt;
}
