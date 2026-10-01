import { loadEnvConfig } from "@next/env";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import * as schema from "@/server/db/schema";
import { obtenerDbAuth } from "@/server/auth/database";

loadEnvConfig(process.cwd());

export const auth = betterAuth({
  appName: "Chatarrería El Cocha",
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(obtenerDbAuth(), {
    provider: "pg",
    schema: {
      user: schema.authUser,
      session: schema.authSession,
      account: schema.authAccount,
      verification: schema.authVerification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    revokeSessionsOnPasswordReset: true,
  },
  plugins: [admin(), nextCookies()],
  advanced: {
    database: { generateId: "uuid" },
  },
});
