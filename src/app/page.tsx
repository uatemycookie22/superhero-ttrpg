import Link from "next/link";
import { Suspense } from "react";
import CharacterList from "@/components/CharacterList";
import CharacterListSkeleton from "@/components/CharacterListSkeleton";

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
              Be your favorite superhero 🦸‍♀️
            </p>
          </Link>

          {/* Saved Characters List */}
          <Suspense fallback={<CharacterListSkeleton />}>
            <CharacterList />
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
