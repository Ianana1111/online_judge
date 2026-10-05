import { runProcess } from "./process.js";
export const RAILWAY_PROJECT = "989e8e66-0317-4d49-b353-f12da6edcea3";
export const RAILWAY_API = "3be60c60-490c-4ce1-b1b2-11ffbff2955a";
export const VERCEL_PROJECT = "prj_cMut2xMELaD8i0beZilaaVbe4BaF";
export const VERCEL_TEAM = "team_cDcMvc6mQrfIDBK22CiN82U9";
export async function railwayVariables(service: string) {
  if (!["api", "judge", "Postgres", "Redis"].includes(service)) throw new Error("Unsupported variable scope");
  const result = await runProcess("railway", ["variables", "--project", RAILWAY_PROJECT, "--service", service, "--environment", "production", "--json"]);
  if (result.code) throw new Error("RAILWAY_AUTH_REQUIRED"); return JSON.parse(result.stdout) as Record<string, string>;
}
