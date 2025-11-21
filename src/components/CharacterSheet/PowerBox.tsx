'use client';

import { useState } from 'react';
import { Zap } from 'lucide-react';
import Drawer from '@/components/Drawer';
import CollapsibleListItem from '@/components/CollapsibleListItem';
import { getAllPowers } from '@/services/power-service';
import { useQuery } from '@tanstack/react-query';

type PowerRef = { id: string; name: string };
type Power = { id: string; name: string; description: string };

interface PowerBoxProps {
  initialPowers: PowerRef[];
  onPowersChange: (powers: PowerRef[]) => void;
}

export default function PowerBox({ initialPowers, onPowersChange }: PowerBoxProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedPowers, setSelectedPowers] = useState<PowerRef[]>(initialPowers);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: powers, isPending } = useQuery({ 
    queryKey: ['powers'], 
    queryFn: getAllPowers, 
    enabled: isDrawerOpen 
  });

  function addPower(power: Power) {
    if (!selectedPowers.find(p => p.id === power.id)) {
      const updated = [...selectedPowers, { id: power.id, name: power.name }];
      setSelectedPowers(updated);
      onPowersChange(updated);
    }
  }

  function removePower(power: PowerRef) {
    const updated = selectedPowers.filter(p => p.id !== power.id);
    setSelectedPowers(updated);
    onPowersChange(updated);
  }

  const selectedPowersDetails = powers
    ?.filter((power) => selectedPowers.find((selectedPower) => selectedPower.id === power.id));

  return (
    <>
      <div className="w-full flex flex-col gap-2">
        <div className="flex justify-between">
          <p>Powers</p>
          <Zap className="w-12 h-12" />
        </div>
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-white rounded"
        >
          Manage Powers
        </button>
        <p className="text-sm whitespace-pre-wrap">
          {selectedPowers.map(p => p.name).join(', ') || 'None'}
        </p>
      </div>

      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
        <h2 className="text-xl font-bold mb-4">Manage Powers</h2>

        <div className="mb-6">
          <h3 className="font-semibold mb-2">Applied Powers</h3>
          <div className="space-y-2">
            {isPending ? (
              <>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="p-3 bg-bg-neutral-secondary rounded animate-pulse">
                    <div className="h-4 bg-bg-neutral-tertiary rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-bg-neutral-tertiary rounded w-2/3"></div>
                  </div>
                ))}
              </>
            ) : (
              selectedPowersDetails
                ?.map(power => {
                  return (
                    <CollapsibleListItem
                      key={power.id}
                      title={power.name}
                      description={power.description}
                      actionButton={
                        <button
                          onClick={() => removePower({ id: power.id, name: power.name })}
                          className="px-2 py-1 text-sm bg-error-primary hover:bg-error-secondary text-white rounded"
                        >
                          Remove
                        </button>
                      }
                    />
                  );
                })
            )}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Add Power</h3>
          <input
            type="text"
            placeholder="Search powers..."
            className="w-full px-4 py-2 mb-4 bg-bg-neutral-secondary text-neutral-primary rounded"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="space-y-2">
            {isPending ? (
              <>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="p-3 bg-bg-neutral-secondary rounded animate-pulse">
                    <div className="h-4 bg-bg-neutral-tertiary rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-bg-neutral-tertiary rounded w-2/3"></div>
                  </div>
                ))}
              </>
            ) : (
              powers
                ?.filter(p =>
                  p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  p.description.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map(power => {
                  const isAdded = !!selectedPowers.find(p => p.id === power.id);
                  return (
                    <CollapsibleListItem
                      key={power.id}
                      title={power.name}
                      description={power.description}
                      actionButton={
                        <button
                          onClick={() => addPower(power)}
                          disabled={isAdded}
                          className="px-3 py-1 text-sm bg-brand-primary hover:bg-brand-secondary text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
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
