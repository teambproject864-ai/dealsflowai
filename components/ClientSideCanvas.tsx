"use client";

import dynamic from "next/dynamic";

export const ClientSideCanvas = dynamic(
  () => import("@/components/GlobalCanvas").then((mod) => mod.GlobalCanvas),
  { ssr: false }
);
