'use client';

import { Drawer as VaulDrawer } from 'vaul';
import { ReactNode } from 'react';
import useWindowSize from '@/hooks/use-window-size';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function Drawer({ isOpen, onClose, children }: DrawerProps) {
  const {width, height} = useWindowSize()
  return (
    <VaulDrawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()} direction={width < 475 ? "bottom" : "right"}>
      <VaulDrawer.Portal>
        <VaulDrawer.Overlay className="fixed inset-0 bg-black/40" />
        <VaulDrawer.Content className={`
        bg-white dark:bg-gray-900 flex flex-col rounded-t-[10px] mt-24 h-[90%] fixed bottom-0 left-0 right-0 outline-none
          sm:right-2 sm:top-2 sm:bottom-2 sm:z-10 sm:w-[310px] sm:mt-0 sm:flex-row sm:left-auto sm:h-full
        `}>
          <VaulDrawer.Title className="sr-only">Drawer</VaulDrawer.Title>
          <div className="p-4 flex-1 overflow-y-auto">
            {children}
          </div>
        </VaulDrawer.Content>
      </VaulDrawer.Portal>
    </VaulDrawer.Root>
  );
}
