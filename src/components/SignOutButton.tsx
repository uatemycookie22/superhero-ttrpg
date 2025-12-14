"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function SignOutButton() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/");
  }

  if (!session) {
    return (
      <Link
        href="/login"
        className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
      >
        Sign in
      </Link>
    );
  }

  return (
    <button
      onClick={handleSignOut}
      className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
    >
      Sign out
    </button>
  );
}
