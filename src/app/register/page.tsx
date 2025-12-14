"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { deleteOrphanedUser } from "@/lib/auth-server";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !username) return;

    setError("");
    setLoading(true);
    try {
      // Create account with email/password (password is random, user won't use it)
      const signUpResult = await authClient.signUp.email({
        email,
        name: username,
        username: username,
        password: crypto.randomUUID(),
      });

      if (signUpResult.error) {
        console.error("Registration error:", signUpResult.error);
        const msg = signUpResult.error.message || "";
        const code = signUpResult.error.code || "";
        const details = (signUpResult.error as any).details;
        
        // Check for unique constraint violations
        if (details?.code === "SQLITE_CONSTRAINT_UNIQUE" || code.includes("UNIQUE")) {
          // Try to determine which field by checking the error message
          if (msg.toLowerCase().includes("email") || details?.message?.toLowerCase().includes("email")) {
            setError("Email is already registered");
          } else {
            setError("Username is already taken");
          }
        } else if (msg.toLowerCase().includes("email") && msg.toLowerCase().includes("already")) {
          setError("Email is already registered");
        } else if (msg.toLowerCase().includes("username")) {
          setError("Username is already taken");
        } else {
          setError(msg || "Registration failed");
        }
        setLoading(false);
        return;
      }

      const userId = signUpResult.data?.user?.id;

      // Now add a passkey to the account
      const passkeyResult = await authClient.passkey.addPasskey();
      if (passkeyResult.error) {
        console.error("Passkey error:", passkeyResult.error);
        
        // Rollback: delete the orphaned account (no passkeys attached)
        if (userId) {
          try {
            await deleteOrphanedUser(userId);
            await authClient.signOut();
          } catch (e) {
            console.error("Failed to clean up account:", e);
            await authClient.signOut();
          }
        }
        
        setError("Passkey registration was cancelled. Please try again.");
        setLoading(false);
        return;
      }
      
      router.push("/");
    } catch (err) {
      console.error("Registration exception:", err);
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16">
      <div className="p-8 rounded-lg border-2 border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <h1 className="text-2xl font-bold mb-6 text-center">Create Account</h1>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <label className="block text-sm font-medium mb-2">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose a username"
            className="w-full px-4 py-2 mb-4 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-violet-500"
            required
          />

          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="hero@example.com"
            className="w-full px-4 py-2 mb-6 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-violet-500"
            required
          />

          <button
            type="submit"
            disabled={loading || !email || !username}
            className="w-full py-3 px-4 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white font-semibold transition-colors"
          >
            {loading ? "Creating account..." : "🔐 Register with Passkey"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="text-violet-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
