'use client';

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getCharacters } from "@/services/character-service";
import CharacterListSkeleton from "./CharacterListSkeleton";

export default function CharacterList() {
  const { data: characters, isLoading } = useQuery({
    queryKey: ['characters'],
    queryFn: async () => {
      const saved = localStorage.getItem('savedCharacterIds');
      if (!saved) return [];
      const ids = JSON.parse(saved) as string[];
      const chars = await getCharacters(ids);
      return chars.sort((a, b) => {
        const aTime = a.lastAccessedAt?.getTime() ?? 0;
        const bTime = b.lastAccessedAt?.getTime() ?? 0;
        return bTime - aTime;
      });
    },
  });

  if (isLoading) return <CharacterListSkeleton />;
  if (!characters?.length) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Your Characters</h3>
      <div className="space-y-2">
        {characters.map((char) => (
          <Link
            key={char.id}
            href={`/character-sheet/${char.id}`}
            prefetch={false}
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
