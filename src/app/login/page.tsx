"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handlePasskeyLogin() {
    setError("");
    setLoading(true);
    try {
      const result = await authClient.signIn.passkey();
      if (result.error) {
        setError(result.error.message || "Passkey login failed");
      } else {
        router.push("/");
      }
    } catch {
      setError("Passkey login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16">
      <div className="p-8 rounded-lg border-2 border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handlePasskeyLogin}
          disabled={loading}
          className="w-full py-3 px-4 mb-4 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white font-semibold transition-colors"
        >
          {loading ? "Signing in..." : "🔐 Sign in with Passkey"}
        </button>

        <div className="mt-6 text-center space-y-2">
          <p className="text-gray-600 dark:text-gray-400">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-violet-600 hover:underline">
              Register
            </Link>
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-sm">
            Lost your passkey?{" "}
            <Link href="/recover" className="text-violet-600 hover:underline">
              Recover account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
