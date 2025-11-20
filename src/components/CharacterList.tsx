'use client';

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { getCharacters } from "@/services/character-service";
import type { Character } from "@/db/schema";

export default function CharacterList() {
  const [charactersPromise, setCharactersPromise] = useState<Promise<Character[]> | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('savedCharacterIds');
    if (saved) {
      const ids = JSON.parse(saved) as string[];
      const promise = getCharacters(ids).then(characters => {
        // Sort by lastAccessedAt descending
        characters.sort((a, b) => {
          const aTime = a.lastAccessedAt?.getTime() ?? 0;
          const bTime = b.lastAccessedAt?.getTime() ?? 0;
          return bTime - aTime;
        });
        return characters;
      });
      setCharactersPromise(promise);
    } else {
      setCharactersPromise(Promise.resolve([]));
    }
  }, []);

  if (!charactersPromise) {
    return null;
  }

  const characters = use(charactersPromise);

  if (characters.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Your Characters</h3>
      <div className="space-y-2">
        {characters.map((char) => (
          <Link
            key={char.id}
            href={`/character-sheet/${char.id}`}
            className="block p-4 rounded-lg border border-gray-200 dark:border-zinc-800 hover:border-violet-500 dark:hover:border-violet-500 transition-colors"
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">{char.name || 'Unnamed Hero'}</span>
              <span className="text-sm text-gray-500">
                Lv. {(char.attributes?.level as number) ?? 0}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
