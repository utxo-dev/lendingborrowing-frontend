import { create } from 'zustand';


export const useSuccessModal = create((set) => ({
  isOpen: false,
  transactionId: null,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
  updateTxId: (tId) => set({ transactionId: tId }),
}));