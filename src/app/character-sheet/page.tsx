import CharacterSheet from "@/components/CharacterSheet/character-sheet"
import Link from "next/link"

type CharacterSheetProps = {
    params: Promise<{ slug: string }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}
export default async function NewCharacterSheetPage({ params }: CharacterSheetProps) {
  // TODO: Pass params promise to character sheet content component

  return (<>
      <Link href="/" className="inline-block mb-4 text-violet-500 hover:text-violet-600 transition-colors">
        ← Back to Home
      </Link>
    <CharacterSheet key={Date.now()} />
  </>)
}
