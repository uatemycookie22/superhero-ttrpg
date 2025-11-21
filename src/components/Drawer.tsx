'use client';

import { useEffect, useRef } from 'react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Drawer({ isOpen, onClose, children }: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50">
      <div
        ref={drawerRef}
        className="fixed bg-white dark:bg-gray-900 shadow-xl
          md:right-0 md:top-0 md:h-full md:w-96
          max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:max-h-[80vh] max-md:rounded-t-2xl"
      >
        <div className="p-6 h-full overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
