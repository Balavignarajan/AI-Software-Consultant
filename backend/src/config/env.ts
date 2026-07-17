import "dotenv/config";

export type NodeEnv = "development" | "production" | "test";

export type EnvConfig = {
  PORT: number;
  NODE_ENV: NodeEnv;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  ACCESS_TOKEN_EXPIRES: string;
  REFRESH_TOKEN_EXPIRES: string;
  OPENAI_API_KEY: string;
  APP_NAME: string;
  APP_VERSION: string;
};

function resolveNodeEnv(value: string | undefined): NodeEnv {
  if (value === "production" || value === "test" || value === "development") {
    return value;
  }

  return "development";
}

function loadEnv(): EnvConfig {
  return {
    PORT: Number(process.env.PORT) || 5000,
    NODE_ENV: resolveNodeEnv(process.env.NODE_ENV),
    DATABASE_URL: process.env.DATABASE_URL ?? "",
    JWT_SECRET: process.env.JWT_SECRET ?? "",
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ?? "",
    ACCESS_TOKEN_EXPIRES: process.env.ACCESS_TOKEN_EXPIRES ?? "15m",
    REFRESH_TOKEN_EXPIRES: process.env.REFRESH_TOKEN_EXPIRES ?? "7d",
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "",
    APP_NAME: process.env.APP_NAME ?? "AI Software Consultant",
    APP_VERSION: process.env.APP_VERSION ?? "1.0.0",
  };
}

export const config: EnvConfig = loadEnv();
