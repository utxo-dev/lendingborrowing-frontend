"use client";
import React from "react";
import { WalletModal } from "@/components/layout/wallet-connect-model";
import { useMounted } from "@/hooks/use-mounted";
import { LendModel } from "@/components/models/lend-model"
import { BorrowModal } from "@/components/models/borrow-model"
import { SuccessModel } from "@/components/models/success-model"


export const ModalProvider = () => {
  const mounted = useMounted()

  if (!mounted) {
    return null;
  }

  return (
    <>
  
      <WalletModal />
      <LendModel />
      <BorrowModal />
      <SuccessModel />
      {/* add your own modals here... */}
    </>
  );
};