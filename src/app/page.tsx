import Link from "next/link";
import { Suspense } from "react";
import { getSession } from "@/lib/auth-server";
import { db } from "@/db/client";
import { characters } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import CharacterList from "@/components/CharacterList";
import CharacterListSkeleton from "@/components/CharacterListSkeleton";

async function AuthenticatedContent() {
  const session = await getSession();
  
  if (!session) {
    // Not logged in - show localStorage characters
    return (
      <div>
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            Playing as guest. <Link href="/register" className="text-violet-600 hover:underline">Register</Link> to save your characters.
          </p>
        </div>
        <CharacterList />
      </div>
    );
  }
  
  // Logged in - show user's characters from DB
  const userCharacters = await db.query.characters.findMany({
    where: eq(characters.createdBy, session.user.id),
    orderBy: desc(characters.updatedAt),
  });

  return (
    <div>
      <div className="mb-6">
        <p className="text-gray-600 dark:text-gray-400">
          Welcome, <strong>{session.user.username}</strong>
        </p>
      </div>

      {userCharacters.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Your Characters</h3>
          <div className="space-y-2">
            {userCharacters.map((char) => (
              <Link
                key={char.id}
                href={`/character-sheet/${char.id}`}
                className="block p-4 rounded-lg border border-gray-200 dark:border-zinc-800 hover:border-violet-500 dark:hover:border-violet-500 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{char.name || 'Unnamed Hero'}</span>
                  <span className="text-sm text-gray-500">
                    Lv. {(char.attributes as any)?.level ?? 0}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column - Campaigns */}
        <div>
          <h2 className="text-3xl font-bold mb-6">Campaigns</h2>
          <div className="p-8 rounded-lg border-2 border-gray-300 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800 opacity-50 cursor-not-allowed">
            <div className="text-6xl mb-4 text-center">🚧</div>
            <h3 className="text-xl font-semibold mb-2 text-center">Under Construction</h3>
            <p className="text-gray-600 dark:text-gray-400 text-center">
              Play with friends 🫂
            </p>
          </div>
        </div>

        {/* Right Column - Characters */}
        <div>
          <h2 className="text-3xl font-bold mb-6">Characters</h2>
          
          {/* Create Character Button */}
          <Link
            href="/character-sheet"
            className="block p-6 mb-6 rounded-lg border-2 border-gray-200 dark:border-zinc-800 hover:border-violet-500 dark:hover:border-violet-500 transition-colors group"
          >
            <h3 className="text-xl font-semibold mb-2 group-hover:text-violet-500 transition-colors">
              + Create New Character
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Be your favorite superhero 🦸♀️
            </p>
          </Link>

          {/* Character List */}
          <Suspense fallback={<div>Loading...</div>}>
            <AuthenticatedContent />
          </Suspense>
        </div>
      </div>

      {/* Credits */}
      <div className="mt-16 pt-8 border-t border-gray-300 dark:border-zinc-700">
        <h3 className="text-2xl font-semibold mb-6 text-center">Credits</h3>
        <div className="space-y-3 text-lg text-center">
          <p>
            <span className="font-semibold">Creative Director:</span> Rashard G
          </p>
          <p>
            <span className="font-semibold">CEO:</span> Nicolas M
          </p>
          <p>
            <span className="font-semibold">Web Developer & Artist:</span> Liz H
          </p>
          <p>
            <span className="font-semibold">Game Designer:</span> Max
          </p>
          <p>
            <span className="font-semibold">Web Developer:</span> Lysander H
          </p>
        </div>
      </div>
    </div>
  );
}
