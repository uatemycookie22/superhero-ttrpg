"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function RecoverPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRecover(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setError("");
    setLoading(true);
    try {
      const result = await authClient.signIn.magicLink({ email });
      if (result.error) {
        setError(result.error.message || "Failed to send recovery link");
      } else {
        setSent(true);
      }
    } catch {
      setError("Failed to send recovery link");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="max-w-md mx-auto mt-16">
        <div className="p-8 rounded-lg border-2 border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="text-6xl mb-4 text-center">📧</div>
          <h1 className="text-2xl font-bold mb-4 text-center">Check your email</h1>
          <p className="text-gray-600 dark:text-gray-400 text-center">
            We sent a recovery link to <strong>{email}</strong>
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-sm text-center mt-4">
            Click the link to sign in and register a new passkey. It expires in 5 minutes.
          </p>
          <Link
            href="/login"
            className="block mt-6 text-center text-violet-600 hover:underline"
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-16">
      <div className="p-8 rounded-lg border-2 border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <h1 className="text-2xl font-bold mb-2 text-center">Recover Account</h1>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
          Lost your passkey? We&apos;ll send you a magic link to sign in.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRecover}>
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="hero@example.com"
            className="w-full px-4 py-2 mb-4 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-violet-500"
            required
          />
          <button
            type="submit"
            disabled={loading || !email}
            className="w-full py-3 px-4 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white font-semibold transition-colors"
          >
            {loading ? "Sending..." : "Send Recovery Link"}
          </button>
        </form>

        <Link
          href="/login"
          className="block mt-6 text-center text-violet-600 hover:underline"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
}
