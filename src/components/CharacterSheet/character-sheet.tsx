'use client';
import { Character } from "@/db/schema";
import { createCampaign, getCampaign } from "@/services/campaign-service";
import { createCharacter, getCharacter, touchCharacter, updateCharacter } from "@/services/character-service";
import { Skull, User, Hand, CloudLightning, ThumbsUp, Star, Check, Loader2 } from "lucide-react"
import { ChangeEvent, ComponentProps, JSX, useEffect, useState } from "react"
import { useDebounce } from 'use-debounce';
import StatRadarChart from "@/components/StatRadarChart";
import Drawer from "@/components/Drawer";
import WeaknessBox from "./WeaknessBox";



type EditableCharacter = Pick<Character, 'name' | 'attributes'>

type SheetInputProps = Pick<ComponentProps<'label'>, 'htmlFor'> & ComponentProps<'input'> & { label: string }
function SheetInput({ label, id, className, value, onChange, ...rest }: SheetInputProps) {
    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        onChange?.(e)
    }

    return (<>
        <div className="flex flex-col">
            <label htmlFor={id} className="">{label}</label>
            <input className="rounded text-neutral-900 w-full max-w-sm sm:max-w-40" {...rest} value={value} onChange={handleChange} />
        </div>
    </>)
}

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

type CharacterSheetProps = {
    onCharacterCreate?: (character: EditableCharacter) => void,
    onCharacterChange?: (character: EditableCharacter) => void,
    existingCharacter?: Character,
    lastAccessed?: string,
}
export default function CharacterSheet(props: CharacterSheetProps) {
    const [characterCreated, setCharacterCreated] = useState(!!props.existingCharacter)
    const [characterId, setCharacterId] = useState<string | undefined>(props.existingCharacter?.id)
    const [character, setCharacter] = useState<EditableCharacter>({
        name: '',
        attributes: {},
        ...props.existingCharacter,
    })
    const [copied, setCopied] = useState(false)
    const [isInitialMount, setIsInitialMount] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [justSaved, setJustSaved] = useState(false)

    const [origin, setOrigin] = useState('');

    useEffect(() => {
        // This code runs only on the client side after the component mounts
        if (typeof window !== 'undefined') {
            setOrigin(window.location.origin);
        }

        if (props.existingCharacter) {
            touchCharacter(props.existingCharacter.id)
        }
        
        // Mark initial mount as complete
        setIsInitialMount(false)
    }, []); // Empty dependency array ensures this runs once after initial render


    function handleChange(field: keyof EditableCharacter, value: EditableCharacter[typeof field]) {
        const updated = { ...character, [field]: value };
        setCharacter(updated);
        props.onCharacterChange?.(updated);
        setIsSaving(true);
        setJustSaved(false);
    }

    // Create character on first input
    useEffect(() => {
        if (characterCreated) return;

        async function initCampaignAndCharacter() {
            let tmpCampaign = await getCampaign('tmpCampaign')

            if (!tmpCampaign) {
                tmpCampaign = await createCampaign({
                    name: 'tmpCampaign',
                    overrideId: 'tmpCampaign',
                    createdBy: 'tmp',
                })
            }

            const newCharacter = await createCharacter({
                ...character,
                campaignId: tmpCampaign?.id,
                createdBy: 'tmp',
            })

            setCharacterId(newCharacter.id)
            props.onCharacterChange?.(newCharacter)
        }
        if (character.name) {
            setCharacterCreated(true)
            initCampaignAndCharacter()
        }
    }, [character])

    const [debouncedCharacter] = useDebounce(character, 1000)
    
    // Save to localStorage when characterId is set
    useEffect(() => {
        if (!characterId) return;
        
        const saved = localStorage.getItem('savedCharacterIds');
        const ids = saved ? JSON.parse(saved) : [];
        if (!ids.includes(characterId)) {
            ids.push(characterId);
            localStorage.setItem('savedCharacterIds', JSON.stringify(ids));
        }
    }, [characterId]);
    
    useEffect(() => {
        // Skip sync on initial mount
        if (isInitialMount) return;
        
        async function syncCharacter() {
            if (!characterId) return;

            const currentCharacter = await getCharacter(characterId)
            if (!currentCharacter) return;

            await updateCharacter(characterId, debouncedCharacter)
            setIsSaving(false);
            setJustSaved(true);
            setTimeout(() => setJustSaved(false), 2000);
        }
        syncCharacter()
    }, [debouncedCharacter, characterId])

    function handleNameChange(e: ChangeEvent<HTMLInputElement>) {
        handleChange('name', e.target.value)
    }

    function handleAttributeChange(key: string, value: string | number | number[] | {} ) {
        handleChange('attributes', { ...character.attributes, [key]: value })
    }

    function copyLink() {
        if (origin && characterId) {
            navigator.clipboard.writeText(`${origin}/character-sheet/${characterId}`)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    return (<>
         <div id="copy-link" className="mb-4">
            { origin && characterId && (
                <p className="flex items-center gap-2 text-xs">
                    Save this link to revisit this character: {`${origin}/character-sheet/${characterId}`}
                    <button onClick={copyLink} className="px-1.5 py-0.5 text-xs bg-violet-600 text-white rounded hover:bg-violet-700 flex items-center gap-1">
                        {copied ? <Check className="w-3 h-3 text-green-400" /> : 'Copy'}
                    </button>
                    {isSaving && (
                        <span className="text-gray-500 flex items-center gap-1 ml-2">
                            <Loader2 className="w-3 h-3 animate-spin" /> Saving...
                        </span>
                    )}
                    {justSaved && (
                        <span className="text-green-600 flex items-center gap-1 ml-2">
                            <Check className="w-3 h-3" /> Saved!
                        </span>
                    )}
                </p>
            )}
        </div>

        <div id="character-sheet-grid" className="grid grid-cols-3 gap-4">
            <div id="hero-identity" className="border-2 p-4 max-w-48 col-span-2">
                <SheetInput id="alter_ego" label="Alter ego" name="Alter ego" type="text" 
                    value={character.attributes?.alterEgo as string || ''} 
                    onChange={(e) => handleAttributeChange('alterEgo', e.target.value)} />
                <SheetInput id="hero_name" label="Hero name" name="Hero name" type="text" onChange={handleNameChange} value={character.name} />
            </div>

            <div id="hero-level" className="border-2 p-2 sm:p-4 w-full col-start-3">
                <CamperStatInput id="level" label="Level" name="Level" type="number" min={0} max={20}
                    value={character.attributes?.level as number || 0} 
                    onChange={(e) => handleAttributeChange('level', Number(e.target.value))} />
            </div>


            <div id="hero-camper-stats" className="border-2 p-4 col-span-3 sm:col-span-1 grid grid-cols-2 sm:grid-cols-1 gap-6 ">
                <CamperStatInput id="charm" label="Charm" name="Charm" type="number" min={0} max={10}
                    value={character.attributes?.charm as number || 0} 
                    onChange={(e) => handleAttributeChange('charm', Number(e.target.value))} />
                <CamperStatInput id="agility" label="Agility" name="Agility" type="number" min={0} max={10}
                    value={character.attributes?.agility as number || 0} 
                    onChange={(e) => handleAttributeChange('agility', Number(e.target.value))} />
                <CamperStatInput id="might" label="Might" name="Might" type="number" min={0} max={10}
                    value={character.attributes?.might as number || 0} 
                    onChange={(e) => handleAttributeChange('might', Number(e.target.value))} />
                <CamperStatInput id="prowess" label="Prowess" name="Prowess" type="number" min={0} max={10}
                    value={character.attributes?.power as number || 0} 
                    onChange={(e) => handleAttributeChange('power', Number(e.target.value))} />
                <CamperStatInput id="endurance" label="Endurance" name="Endurance" type="number" min={0} max={10}
                    value={character.attributes?.endurance as number || 0} 
                    onChange={(e) => handleAttributeChange('endurance', Number(e.target.value))} />
                <CamperStatInput id="resolve" label="Resolve" name="Resolve" type="number" min={0} max={10}
                    value={character.attributes?.resolve as number || 0} 
                    onChange={(e) => handleAttributeChange('resolve', Number(e.target.value))} />
            </div>

            <div id="stats-radar" className="border-2 p-4 col-span-3 sm:col-span-2">
                <h2 className="text-lg font-bold mb-2">Stats Overview</h2>
                <StatRadarChart stats={[
                    { stat: 'Charm', value: ((character.attributes?.charm as number) || 0) + 1, max: 10 },
                    { stat: 'Agility', value: ((character.attributes?.agility as number) || 0) + 1, max: 10 },
                    { stat: 'Might', value: ((character.attributes?.might as number) || 0) + 1, max: 10 },
                    { stat: 'Prowess', value: ((character.attributes?.power as number) || 0) + 1, max: 10 },
                    { stat: 'Endurance', value: ((character.attributes?.endurance as number) || 0) + 1, max: 10 },
                    { stat: 'Resolve', value: ((character.attributes?.resolve as number) || 0) + 1, max: 10 },
                ]} />
            </div>

            <div id="hero-camper-prowess" className="grid border-2 p-0 gap-0 col-span-3 grid-cols-subgrid">
                <ProwessBox>
                    <WeaknessBox 
                        initialWeaknesses={(character.attributes?.weaknesses as any[]) || []}
                        onWeaknessesChange={(weaknesses) => handleAttributeChange('weaknesses', weaknesses)}
                    />
                </ProwessBox>

                <ProwessBox>
                    <div className="w-full flex flex-col gap-4">
                        <h4>Reflex/Strike</h4>
                        <IconLabelInput label={<User />} 
                            value={character.attributes?.reflex as number || 0} 
                            onChange={(e) => handleAttributeChange('reflex', Number(e.target.value))} />
                        <IconLabelInput label={<Hand />} 
                            value={character.attributes?.strike as number || 0} 
                            onChange={(e) => handleAttributeChange('strike', Number(e.target.value))} />
                    </div>
                </ProwessBox>

                <ProwessBox>
                    <div className="w-full flex flex-col gap-4">
                        <p>Fortune</p>
                        <div className="flex flex-wrap gap-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <input key={i} type="checkbox" className="w-6 h-6" 
                                    checked={!!(character.attributes?.fortune as number[] || [])[i]} 
                                    onChange={(e) => {
                                        const fortune = [...(character.attributes?.fortune as number[] || [0,0,0,0,0])];
                                        fortune[i] = e.target.checked ? 1 : 0;
                                        handleAttributeChange('fortune', fortune);
                                    }} />
                            ))}
                        </div>

                        <p>Notes</p>
                        <textarea name="notes" className="bg-gray-50 resize-y grow min-h-32 text-black rounded p-2 text-sm" placeholder="Session notes..." 
                            value={character.attributes?.notes as string || ''} 
                            onChange={(e) => handleAttributeChange('notes', e.target.value)} />
                    </div>
                </ProwessBox>

                <ProwessBox>
                    <div className="w-full flex flex-col gap-2">
                        <div className="flex justify-between">
                            <p>Powers</p>
                            <CloudLightning className="w-12 h-12" />
                        </div>
                        <textarea name="powers" className="bg-gray-50 resize-y grow min-h-32 text-black rounded p-2 text-sm" placeholder="List powers and abilities..." 
                            value={character.attributes?.powers as string || ''} 
                            onChange={(e) => handleAttributeChange('powers', e.target.value)} />
                    </div>
                </ProwessBox>

                <ProwessBox>
                    <div className="w-full flex flex-col gap-2">
                        <p>Attacks</p>
                        <textarea name="attacks" className="bg-gray-50 resize-y grow min-h-32 text-black rounded p-2 text-sm" placeholder="List attacks and damage..." 
                            value={character.attributes?.attacks as string || ''} 
                            onChange={(e) => handleAttributeChange('attacks', e.target.value)} />
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
    </>)
}