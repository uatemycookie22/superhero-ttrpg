import { CloudLightning, Hand, Presentation, Skull, Speaker, Star, ThumbsUp, User, Voicemail } from "lucide-react"
import Link from "next/link"
import { ComponentProps, JSX } from "react"

type SheetInputProps = Pick<ComponentProps<'label'>, 'htmlFor'> & ComponentProps<'input'> & { label: string }
function SheetInput({ label, id, className, ...rest }: SheetInputProps) {
  return (<>
    <div className="flex flex-col">
      <label htmlFor={id} className="">{label}</label>
      <input className="rounded text-neutral-900 w-full max-w-sm sm:max-w-40" {...rest} />
    </div>
  </>)
}

type CharacterSheetProps = {
    params: Promise<{ slug: string }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}
export default async function CharacterSheetPage({ params }: CharacterSheetProps) {
  // TODO: Pass params promise to character sheet content component

  const CamperStatInput = ({ id, label, ...rest }: SheetInputProps) => (<>
    <div className="flex flex-row flex-wrap gap-2 items-center justify-between">
      <label htmlFor={id} className="">{label}</label>
      <input className="rounded text-neutral-900 max-w-16" {...rest} />
    </div>
  </>)

  const ProwessBox = ({ children }: Pick<ComponentProps<'div'>, 'children'>) => (<>
    <div className="border-2 p-2 sm:p-4 w-full min-h-60">
      {children}
    </div>
  </>)

  const IconLabelInput = ({ id, label, ...rest }: Omit<SheetInputProps, 'label'> & { label: JSX.Element }) => (<>
    <div className="flex flex-row flex-wrap gap-2 items-center justify-between">
      {label}
      <input className="rounded text-neutral-900 max-w-12" {...rest} />
    </div>
  </>)

  return (<>
    <div id="character-sheet-container" className="sm:container sm:mx-auto">
      <Link href="/" className="inline-block mb-4 text-violet-500 hover:text-violet-600 transition-colors">
        ← Back to Home
      </Link>
      <div id="character-sheet-grid" className="grid grid-cols-3 gap-4">
        <div id="hero-identity" className="border-2 p-4 max-w-48 col-span-2">
          <SheetInput id="alter_ego" label="Alter ego" name="Alter ego" type="text" />
          <SheetInput id="hero_name" label="Hero name" name="Hero name" type="text" />
        </div>

        <div id="hero-level" className="border-2 p-2 sm:p-4 w-full col-start-3">
          <CamperStatInput id="level"      label="Level"       name="Level"        type="number" />
        </div>


        <div id="hero-camper-stats" className="border-2 p-4 col-span-3 sm:col-span-1 grid grid-cols-2 sm:grid-cols-1 gap-6 ">
          <CamperStatInput id="charm"      label="Charm"       name="Charm"        type="number" />
          <CamperStatInput id="agility"    label="Agility"     name="Agility"      type="number" />
          <CamperStatInput id="might"      label="Might"       name="Might"        type="number" />
          <CamperStatInput id="power"      label="Power"       name="Power"        type="number" />
          <CamperStatInput id="endurance"  label="Endurance"   name="Endurance"    type="number" />
          <CamperStatInput id="resolve"    label="Resolve"     name="Resolve"      type="number" />
        </div>

        <div id="hero-camper-prowess" className="grid border-2 p-0 gap-0 col-span-3 grid-cols-subgrid">
          <ProwessBox>
            <div className="w-full flex flex-col gap-2">
              <div className="flex justify-between">
                <p>Weakness</p>
                <Skull className="w-12 h-12" />
              </div>
              <textarea name="weakness" className="bg-gray-50 resize-y grow min-h-32 text-black rounded p-2 text-sm" placeholder="List weaknesses..." />
            </div>
          </ProwessBox>

          <ProwessBox>
            <div className="w-full flex flex-col gap-4">
              <p>Reflex/Strike</p>
              <IconLabelInput label={<User />} />
              <IconLabelInput label={<Hand />} />
            </div>
          </ProwessBox>

          <ProwessBox>
            <div className="w-full flex flex-col gap-4">
              <p>Fortune</p>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <input key={i} type="checkbox" className="w-6 h-6" />
                ))}
              </div>

              <p>Notes</p>
              <textarea name="notes" className="bg-gray-50 resize-y grow min-h-32 text-black rounded p-2 text-sm" placeholder="Session notes..." />
            </div>
          </ProwessBox>

          <ProwessBox>
            <div className="w-full flex flex-col gap-2">
              <div className="flex justify-between">
                <p>Powers</p>
                <CloudLightning className="w-12 h-12" />
              </div>
              <textarea name="powers" className="bg-gray-50 resize-y grow min-h-32 text-black rounded p-2 text-sm" placeholder="List powers and abilities..." />
            </div>
          </ProwessBox>

          <ProwessBox>
            <div className="w-full flex flex-col gap-2">
              <p>Attacks</p>
              <textarea name="attacks" className="bg-gray-50 resize-y grow min-h-32 text-black rounded p-2 text-sm" placeholder="List attacks and damage..." />
            </div>
          </ProwessBox>

          <ProwessBox>
          <div className="flex flex-col flex-wrap h-full gap-16">
              <div className="w-full flex flex-wrap justify-between">
              <p>Moral Dice</p>
              <ThumbsUp className="w-12 h-12" />
            </div>

            <div className="w-full flex flex-wrap justify-between">
              <p>Reputation</p>
              <Star className="w-12 h-12" />
            </div>
          </div>
          </ProwessBox>
        </div>

      </div>
    </div>
  </>)
}
