import { create } from 'zustand';


export const useWalletAddress = create((set) => ({
  paymentsAddress: null,
  paymentsPublicKey: null,
  ordinalsAddress: null,
  ordinalsPublicKey: null,
  updatePaymentAddress: (paymentsAddress) => set({ paymentsAddress: paymentsAddress }),
  updatePaymentPublicKey: (paymentsPublicKey) => set({ paymentsPublicKey: paymentsPublicKey }),
  updateOrdinalAddress: (ordinalsAddress) => set({ ordinalsAddress: ordinalsAddress }),
  updateOrdinalPublicKey: (ordinalsPublicKey) => set({ ordinalsPublicKey: ordinalsPublicKey }),
  deleteAllWallet: () => set({
    paymentsAddress: null,
    paymentsPublicKey: null,
    ordinalsAddress: null,
    ordinalsPublicKey: null,
  })
}),);
