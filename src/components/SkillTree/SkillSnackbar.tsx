'use client';
import { useEffect, useRef } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Skill, SkillStatus } from '@/types/skills';

interface SkillSnackbarProps {
  skill: Skill | null;
  status: SkillStatus;
  onClose: () => void;
  onUnlock: () => void;
  canAfford: boolean;
  isUnlocking?: boolean;
}

export default function SkillSnackbar({ skill, status, onClose, onUnlock, canAfford, isUnlocking }: SkillSnackbarProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!skill) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [skill, onClose]);

  if (!skill) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md" ref={ref}>
      <div className="bg-gray-800 text-white rounded-lg border border-gray-600 shadow-lg p-4">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1">
            <h3 className="font-bold text-lg">{skill.name}</h3>
            <p className="text-gray-300 text-sm mt-1">{skill.description}</p>
          </div>
          <button onClick={onClose} className="hover:opacity-70">
            <X size={20} />
          </button>
        </div>
        {status === 'available' && (
          <button
            onClick={onUnlock}
            disabled={!canAfford || isUnlocking}
            className={`mt-3 w-full py-2 rounded font-semibold flex items-center justify-center gap-2 ${
              canAfford && !isUnlocking
                ? 'bg-violet-600 hover:bg-violet-500'
                : 'bg-gray-600 cursor-not-allowed'
            }`}
          >
            {isUnlocking ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Unlocking...
              </>
            ) : canAfford ? (
              'Unlock (1 point)'
            ) : (
              'Not enough points'
            )}
          </button>
        )}
        {status === 'unlocked' && (
          <div className="mt-3 text-center text-green-400 font-semibold">✓ Unlocked</div>
        )}
      </div>
    </div>
  );
}
