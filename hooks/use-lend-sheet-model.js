import { create } from 'zustand';

export const useLendSheetModal = create((set) => ({
    isOpen: false,
    data: null,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
  }));