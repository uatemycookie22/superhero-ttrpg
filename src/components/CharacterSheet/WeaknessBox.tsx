'use client';

import { useState, useEffect } from 'react';
import { Skull } from 'lucide-react';
import Drawer from '@/components/Drawer';
import CollapsibleListItem from '@/components/CollapsibleListItem';
import { getAllWeaknesses } from '@/services/weakness-service';
import type { Weakness } from '@/db/schema';

interface WeaknessBoxProps {
  initialWeaknesses: Weakness[];
  onWeaknessesChange: (weaknesses: Weakness[]) => void;
}

export default function WeaknessBox({ initialWeaknesses, onWeaknessesChange }: WeaknessBoxProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedWeaknesses, setSelectedWeaknesses] = useState<Weakness[]>(initialWeaknesses);
  const [searchQuery, setSearchQuery] = useState('');
  const [weaknesses, setWeaknesses] = useState<Weakness[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isDrawerOpen && weaknesses.length === 0) {
      setIsLoading(true);
      getAllWeaknesses().then(data => {
        setWeaknesses(data);
        setIsLoading(false);
      });
    }
  }, [isDrawerOpen, weaknesses.length]);

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
          className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
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
                      className="px-2 py-1 text-sm bg-error-primary hover:bg-error-secondary text-white rounded"
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
            className="w-full px-4 py-2 mb-4 bg-bg-neutral-secondary text-neutral-primary rounded"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="space-y-2">
            {isLoading ? (
              <>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="p-3 bg-bg-neutral-secondary rounded animate-pulse">
                    <div className="h-4 bg-bg-neutral-tertiary rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-bg-neutral-tertiary rounded w-2/3"></div>
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
