import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { passkey } from "@better-auth/passkey";
import { magicLink, username } from "better-auth/plugins";
import { db } from "@/db/client";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendMagicLinkEmail } from "@/lib/email";

export const auth = betterAuth({
  database: drizzleAdapter(db, { 
    provider: "sqlite",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  plugins: [
    username(),
    passkey({
      rpID: process.env.NODE_ENV === "production" 
        ? "callingallheroes.net" 
        : "localhost",
      rpName: "Calling All Heroes",
      origin: process.env.BETTER_AUTH_URL,
    }),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await sendMagicLinkEmail(email, url);
      },
    }),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 365, // 1 year
    updateAge: 60 * 60 * 24 * 7,   // refresh weekly
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60, // 1 hour cache before DB check
    },
  },
});
