"use client";

import { useEffect, useState } from "react";
import { ImmersiveBackground } from "./ImmersiveBackground";

export function ClientImmersiveBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <ImmersiveBackground />;
}
