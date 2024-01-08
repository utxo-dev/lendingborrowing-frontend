"use client";

import { WalletModal } from "@/components/layout/wallet-connect-model";
import { useMounted } from "@/hooks/use-mounted";
import React from "react";

export const ModalProvider = () => {
  const mounted = useMounted()

  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* <SignInModal /> */}
      <WalletModal />
      {/* add your own modals here... */}
    </>
  );
};