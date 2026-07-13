import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());
(process.env as any).NODE_ENV = "test";
