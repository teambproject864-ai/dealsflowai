"use client";

import { useState, useEffect } from "react";

export function useWebGLAvailable() {
  const [available, setAvailable] = useState<boolean>(false);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const hasWebGL = !!(
        window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
      );
      const hasWebGL2 = !!(
        window.WebGL2RenderingContext && canvas.getContext("webgl2")
      );
      setAvailable(hasWebGL || hasWebGL2);
    } catch {
      setAvailable(false);
    }
  }, []);

  return available;
}
