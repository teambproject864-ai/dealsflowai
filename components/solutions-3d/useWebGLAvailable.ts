"use client";

import { useState, useEffect } from "react";

export function useWebGLAvailable() {
  const [available, setAvailable] = useState<boolean>(true);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const hasWebGL = !!(
        window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
      );
      setAvailable(hasWebGL);
    } catch {
      setAvailable(false);
    }
  }, []);

  return available;
}
