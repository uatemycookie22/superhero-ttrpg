'use client';

import { useState, useEffect } from 'react';
import { Skull } from 'lucide-react';
import Drawer from '@/components/Drawer';
import CollapsibleListItem from '@/components/CollapsibleListItem';

type Weakness = { name: string; description: string };

async function fetchWeaknesses(): Promise<Weakness[]> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return [
    { name: "Kryptonite", description: "Exposure to green kryptonite radiation causes severe physical weakness, nausea, and pain. Prolonged exposure can be fatal. The mineral's unique radiation signature disrupts cellular functions and drains superhuman abilities, leaving the hero vulnerable and powerless." },
    { name: "Fire", description: "Extreme heat and flames cause intense pain and can inflict serious burns. Fire-based attacks bypass normal defenses and can quickly overwhelm regenerative abilities. The psychological fear of fire can also impair judgment and tactical decision-making in combat situations." },
    { name: "Water", description: "When fully submerged in water, powers significantly diminish or cease entirely. The hero experiences difficulty breathing and loses the ability to fly or use energy-based abilities. Extended submersion can lead to drowning despite enhanced physiology." },
    { name: "Magic", description: "Mystical forces and enchanted weapons bypass all physical defenses. The hero has no innate resistance to magical attacks, curses, or illusions. Spells can affect the mind, body, or soul directly, making encounters with sorcerers particularly dangerous." },
    { name: "Electricity", description: "High-voltage electrical shocks cause severe pain and temporary paralysis. Electrical attacks can disrupt neural pathways and interfere with the hero's ability to control their powers. Repeated exposure may cause lasting damage to the nervous system." },
    { name: "Cold", description: "Freezing temperatures slow metabolism and reduce physical capabilities. Ice-based attacks can cause hypothermia and frostbite. In extreme cold, the hero's reaction time decreases significantly, and powers that rely on body heat become unreliable or fail completely." },
    { name: "Sound", description: "High-frequency sonic attacks cause debilitating pain and disorientation. The hero's enhanced hearing makes them particularly vulnerable to sonic weapons. Intense sound waves can rupture eardrums, cause internal bleeding, and induce temporary or permanent deafness." },
    { name: "Light", description: "Intense bright light or focused laser beams cause temporary or permanent blindness. Flash-bang effects can disorient and incapacitate. The hero's enhanced vision makes them more susceptible to light-based attacks, requiring special protection in bright environments." },
  ];
}

interface WeaknessBoxProps {
  initialWeaknesses: Weakness[];
  onWeaknessesChange: (weaknesses: Weakness[]) => void;
}

export default function WeaknessBox({ initialWeaknesses, onWeaknessesChange }: WeaknessBoxProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [weaknesses, setWeaknesses] = useState<Weakness[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWeaknesses, setSelectedWeaknesses] = useState<Weakness[]>(initialWeaknesses);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isDrawerOpen && weaknesses.length === 0) {
      setIsLoading(true);
      fetchWeaknesses().then(data => {
        setWeaknesses(data);
        setIsLoading(false);
      });
    }
  }, [isDrawerOpen]);

  function addWeakness(weakness: Weakness) {
    if (!selectedWeaknesses.find(w => w.name === weakness.name)) {
      const updated = [...selectedWeaknesses, weakness];
      setSelectedWeaknesses(updated);
      onWeaknessesChange(updated);
    }
  }

  function removeWeakness(weakness: Weakness) {
    const updated = selectedWeaknesses.filter(w => w.name !== weakness.name);
    setSelectedWeaknesses(updated);
    onWeaknessesChange(updated);
  }

  return (
    <>
      <div className="w-full flex flex-col gap-2">
        <div className="flex justify-between">
          <p>Weakness</p>
          <Skull className="w-12 h-12" />
        </div>
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="px-4 py-2 bg-violet-600 text-white rounded hover:bg-violet-700"
        >
          Manage Weaknesses
        </button>
        <p className="text-sm whitespace-pre-wrap">
          {selectedWeaknesses.map(w => w.name).join(', ') || 'None'}
        </p>
      </div>

      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
        <h2 className="text-xl font-bold mb-4">Manage Weaknesses</h2>
        
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Applied Weaknesses</h3>
          <div className="space-y-2">
            {selectedWeaknesses.length === 0 ? (
              <p className="text-sm text-gray-500">No weaknesses applied</p>
            ) : (
              selectedWeaknesses.map(weakness => (
                <CollapsibleListItem
                  key={weakness.name}
                  title={weakness.name}
                  description={weakness.description}
                  actionButton={
                    <button
                      onClick={() => removeWeakness(weakness)}
                      className="px-2 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Remove
                    </button>
                  }
                />
              ))
            )}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Add Weakness</h3>
          <input
            type="text"
            placeholder="Search weaknesses..."
            className="w-full px-4 py-2 mb-4 bg-gray-50 dark:bg-gray-800 text-black dark:text-white rounded"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="space-y-2">
            {isLoading ? (
              <>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="p-3 bg-gray-50 dark:bg-gray-800 rounded animate-pulse">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
                  </div>
                ))}
              </>
            ) : (
              weaknesses
                .filter(w => 
                  w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  w.description.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map(weakness => {
                  const isAdded = !!selectedWeaknesses.find(w => w.name === weakness.name);
                  return (
                    <CollapsibleListItem
                      key={weakness.name}
                      title={weakness.name}
                      description={weakness.description}
                      actionButton={
                        <button
                          onClick={() => addWeakness(weakness)}
                          disabled={isAdded}
                          className="px-3 py-1 text-sm bg-violet-600 text-white rounded hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Add
                        </button>
                      }
                    />
                  );
                })
            )}
          </div>
        </div>
      </Drawer>
    </>
  );
}
