import { createAuthClient } from "better-auth/react";
import { passkeyClient } from "@better-auth/passkey/client";
import { magicLinkClient, usernameClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [
    usernameClient(),
    passkeyClient(),
    magicLinkClient(),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;
