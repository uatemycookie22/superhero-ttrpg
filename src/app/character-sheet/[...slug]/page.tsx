import CharacterSheet from "@/components/CharacterSheet/character-sheet"
import { getCharacter } from "@/services/character-service"
import Link from "next/link"
import { notFound } from "next/navigation"

type CharacterSheetProps = {
    params: Promise<{ slug: [string, string] }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}
export default async function CharacterSheetPage({ params }: CharacterSheetProps) {
  // TODO: Pass params promise to character sheet content component

  const { slug } = await params;
  const [characterId] = slug;
  const character = await getCharacter(characterId)
  
  if (!character) {
    notFound()
  }
  return (<>
      <Link href="/" className="inline-block mb-4 text-violet-500 hover:text-violet-600 transition-colors">
        ← Back to Home
      </Link>
    <CharacterSheet existingCharacter={character} />
  </>)
}
