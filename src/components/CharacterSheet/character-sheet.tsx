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
import PowerBox from "./PowerBox";
import { calculateTotalPoints, getStatWithProficiency, characterStatsSchema } from "@/lib/character-validation";
import QuantityInput from "@/components/QuantityInput";
import LevelInput from "@/components/LevelInput";



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

const CamperStatInput = ({ id, label, isProficient, onProficiencyToggle, disableProficiency, value, onChange, ...rest }: SheetInputProps & {
    isProficient?: boolean;
    onProficiencyToggle?: () => void;
    disableProficiency?: boolean;
}) => {
    const numValue = Number(value) || 0;
    const handleDecrement = () => {
        if (numValue > 0) {
            onChange?.({ target: { value: String(numValue - 1) } } as any);
        }
    };
    const handleIncrement = () => {
        if (numValue < 10) {
            onChange?.({ target: { value: String(numValue + 1) } } as any);
        }
    };

    return (
        <div className="flex flex-row gap-2 items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
                {onProficiencyToggle && (
                    <button
                        type="button"
                        onClick={onProficiencyToggle}
                        disabled={disableProficiency}
                        className={`w-6 h-6 flex-shrink-0 rounded border-2 flex items-center justify-center ${isProficient
                            ? 'bg-brand-primary border-brand-primary'
                            : disableProficiency
                                ? 'bg-gray-300 border-gray-300 opacity-50 cursor-not-allowed'
                                : 'border-gray-400'
                            }`}
                        title="Toggle proficiency (+3 bonus)"
                    >
                        {isProficient && <Star className="w-4 h-4 text-white" fill="currentColor" />}
                    </button>
                )}
                <label htmlFor={id} className="truncate">
                    <span className="md:hidden">{label.charAt(0)}</span>
                    <span className="hidden md:inline">{label}</span>
                </label>
            </div>
            <QuantityInput
                value={value}
                onChange={onChange}
                onDecrement={handleDecrement}
                onIncrement={handleIncrement}
                {...rest}
            />
        </div>
    );
}

const ProwessBox = ({ children }: Pick<ComponentProps<'div'>, 'children'>) => (<>
    <div className="border-2 p-2 sm:p-4 w-full min-h-60 col-span-3 sm:col-span-1">
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
        attributes: {
            proficiencies: [],
        },
        ...props.existingCharacter,
    })
    const [copied, setCopied] = useState(false)
    const [isInitialMount, setIsInitialMount] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [justSaved, setJustSaved] = useState(false)

    const [origin, setOrigin] = useState('');

    const proficiencies = (character.attributes?.proficiencies as ('charm' | 'agility' | 'might' | 'power' | 'endurance' | 'resolve')[]) || [];
    const totalPoints = calculateTotalPoints({
        charm: character.attributes?.charm as number || 0,
        agility: character.attributes?.agility as number || 0,
        might: character.attributes?.might as number || 0,
        power: character.attributes?.power as number || 0,
        endurance: character.attributes?.endurance as number || 0,
        resolve: character.attributes?.resolve as number || 0,
    });
    const pointsRemaining = 30 - totalPoints;

    function toggleProficiency(stat: 'charm' | 'agility' | 'might' | 'power' | 'endurance' | 'resolve') {
        const current = proficiencies;
        const newProf = current.includes(stat)
            ? current.filter(s => s !== stat)
            : current.length < 2
                ? [...current, stat]
                : current;
        handleAttributeChange('proficiencies', newProf);
    }

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

        return () => {
            if (!props.existingCharacter) {
                setCharacterId(undefined);
                setCharacter({
                    name: '',
                    attributes: {
                        proficiencies: [],
                    },
                });
                setCharacterCreated(false);
                setIsInitialMount(true);
            }
        }
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

            // Validate stats before saving
            const statsToValidate = {
                charm: debouncedCharacter.attributes?.charm as number || 0,
                agility: debouncedCharacter.attributes?.agility as number || 0,
                might: debouncedCharacter.attributes?.might as number || 0,
                power: debouncedCharacter.attributes?.power as number || 0,
                endurance: debouncedCharacter.attributes?.endurance as number || 0,
                resolve: debouncedCharacter.attributes?.resolve as number || 0,
                proficiencies: debouncedCharacter.attributes?.proficiencies as string[],
            };

            const validation = characterStatsSchema.safeParse(statsToValidate);
            if (!validation.success) {
                console.error('Validation failed:', validation.error);
                setIsSaving(false);
                return;
            }

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

    function handleAttributeChange(key: string, value: string | number | number[] | {}) {
        // Validate stat changes
        if (['charm', 'agility', 'might', 'power', 'endurance', 'resolve'].includes(key)) {
            const numValue = value as number;
            // Enforce max 10 per stat
            if (numValue > 10) return;

            // Check if total would exceed 30
            const newTotal = calculateTotalPoints({
                charm: key === 'charm' ? numValue : (character.attributes?.charm as number || 0),
                agility: key === 'agility' ? numValue : (character.attributes?.agility as number || 0),
                might: key === 'might' ? numValue : (character.attributes?.might as number || 0),
                power: key === 'power' ? numValue : (character.attributes?.power as number || 0),
                endurance: key === 'endurance' ? numValue : (character.attributes?.endurance as number || 0),
                resolve: key === 'resolve' ? numValue : (character.attributes?.resolve as number || 0),
            });

            if (newTotal > 30) return;
        }

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
            {origin && characterId && (
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

        <div id="character-sheet-grid" className="grid grid-cols-3 gap-y-4 gap-x-0 md:gap-x-4">
            <div id="hero-identity" className="border-2 p-4 max-w-48 col-span-2">
                <SheetInput id="alter_ego" label="Alter ego" name="Alter ego" type="text"
                    value={character.attributes?.alterEgo as string || ''}
                    onChange={(e) => handleAttributeChange('alterEgo', e.target.value)} />
                <SheetInput id="hero_name" label="Hero name" name="Hero name" type="text" onChange={handleNameChange} value={character.name} />
            </div>

            <div id="hero-level" className="border-2 p-2 sm:p-4 w-full col-start-3">
                <LevelInput
                    id="level"
                    name="Level"
                    type="number"
                    min={0}
                    max={20}
                    value={character.attributes?.level as number || 0}
                    onChange={(e) => handleAttributeChange('level', Number(e.target.value))}
                />
            </div>


            <div id="hero-camper-stats" className="border-2 p-4 col-span-3 sm:col-span-1 grid grid-cols-1 gap-6 ">
                <div className="flex justify-between items-center pb-2 border-b">
                    <span className="font-semibold">Points Remaining:</span>
                    <span className={`text-lg font-bold ${pointsRemaining < 0 ? 'text-error-primary' : ''}`}>
                        {pointsRemaining} / 30
                    </span>
                </div>
                <CamperStatInput id="charm" label="Charm" name="Charm" type="number" min={0} max={10}
                    value={character.attributes?.charm as number || 0}
                    onChange={(e) => handleAttributeChange('charm', Number(e.target.value))}
                    isProficient={proficiencies.includes('charm')}
                    onProficiencyToggle={() => toggleProficiency('charm')}
                    disableProficiency={!proficiencies.includes('charm') && proficiencies.length >= 2} />
                <CamperStatInput id="agility" label="Agility" name="Agility" type="number" min={0} max={10}
                    value={character.attributes?.agility as number || 0}
                    onChange={(e) => handleAttributeChange('agility', Number(e.target.value))}
                    isProficient={proficiencies.includes('agility')}
                    onProficiencyToggle={() => toggleProficiency('agility')}
                    disableProficiency={!proficiencies.includes('agility') && proficiencies.length >= 2} />
                <CamperStatInput id="might" label="Might" name="Might" type="number" min={0} max={10}
                    value={character.attributes?.might as number || 0}
                    onChange={(e) => handleAttributeChange('might', Number(e.target.value))}
                    isProficient={proficiencies.includes('might')}
                    onProficiencyToggle={() => toggleProficiency('might')}
                    disableProficiency={!proficiencies.includes('might') && proficiencies.length >= 2} />
                <CamperStatInput id="prowess" label="Prowess" name="Prowess" type="number" min={0} max={10}
                    value={character.attributes?.power as number || 0}
                    onChange={(e) => handleAttributeChange('power', Number(e.target.value))}
                    isProficient={proficiencies.includes('power')}
                    onProficiencyToggle={() => toggleProficiency('power')}
                    disableProficiency={!proficiencies.includes('power') && proficiencies.length >= 2} />
                <CamperStatInput id="endurance" label="Endurance" name="Endurance" type="number" min={0} max={10}
                    value={character.attributes?.endurance as number || 0}
                    onChange={(e) => handleAttributeChange('endurance', Number(e.target.value))}
                    isProficient={proficiencies.includes('endurance')}
                    onProficiencyToggle={() => toggleProficiency('endurance')}
                    disableProficiency={!proficiencies.includes('endurance') && proficiencies.length >= 2} />
                <CamperStatInput id="resolve" label="Resolve" name="Resolve" type="number" min={0} max={10}
                    value={character.attributes?.resolve as number || 0}
                    onChange={(e) => handleAttributeChange('resolve', Number(e.target.value))}
                    isProficient={proficiencies.includes('resolve')}
                    onProficiencyToggle={() => toggleProficiency('resolve')}
                    disableProficiency={!proficiencies.includes('resolve') && proficiencies.length >= 2} />
            </div>

            <div id="stats-radar" className="border-2 p-4 col-span-3 sm:col-span-2">
                <h2 className="text-lg font-bold mb-2">Stats Overview</h2>
                <StatRadarChart stats={[
                    { stat: 'Charm', value: getStatWithProficiency('charm', (character.attributes?.charm as number) || 0, proficiencies) + 1, max: 13 },
                    { stat: 'Agility', value: getStatWithProficiency('agility', (character.attributes?.agility as number) || 0, proficiencies) + 1, max: 13 },
                    { stat: 'Might', value: getStatWithProficiency('might', (character.attributes?.might as number) || 0, proficiencies) + 1, max: 13 },
                    { stat: 'Prowess', value: getStatWithProficiency('power', (character.attributes?.power as number) || 0, proficiencies) + 1, max: 13 },
                    { stat: 'Endurance', value: getStatWithProficiency('endurance', (character.attributes?.endurance as number) || 0, proficiencies) + 1, max: 13 },
                    { stat: 'Resolve', value: getStatWithProficiency('resolve', (character.attributes?.resolve as number) || 0, proficiencies) + 1, max: 13 },
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
                                        const fortune = [...(character.attributes?.fortune as number[] || [0, 0, 0, 0, 0])];
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
                    <PowerBox
                        initialPowers={character.attributes?.powers as any[] || []}
                        onPowersChange={(powers) => handleAttributeChange('powers', powers)}
                    />
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