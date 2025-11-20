import CharacterSheet from "@/components/CharacterSheet/character-sheet"
import { getCharacter } from "@/services/character-service"
import Link from "next/link"
import { notFound } from "next/navigation"
import { fromDate } from "@/lib/temporal"

type CharacterSheetProps = {
    params: Promise<{ slug: [string, string] }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}
export default async function CharacterSheetPage({ params }: CharacterSheetProps) {
  const { slug } = await params;
  const [characterId] = slug;
  const character = await getCharacter(characterId)
  
  if (!character) {
    notFound()
  }

  const lastAccessed = character.lastAccessedAt 
    ? fromDate(character.lastAccessedAt).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    : 'Never';

  return (<>
      <Link href="/" className="inline-block mb-4 text-violet-500 hover:text-violet-600 transition-colors">
        ← Back to Home
      </Link>
      <p className="text-xs text-gray-500 mb-2">
        Last accessed: {lastAccessed}
      </p>
    <CharacterSheet existingCharacter={character} />
  </>)
}
