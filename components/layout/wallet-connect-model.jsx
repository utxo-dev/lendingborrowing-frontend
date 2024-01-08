"use client";

import { useState } from "react";
import Image from "next/image";
import { Icons } from "@/components/shared/icons";
import { Modal } from "@/components/shared/modal";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { useWalletModal } from "@/hooks/use-wallet-model";


export const WalletModal = () => {
  const walletModal = useWalletModal();
  const [walletClicked, setWalletClicked] = useState(false);

  return (
    <Modal showModal={walletModal.isOpen} setShowModal={walletModal.onClose}>
      <div className="w-full">
        <div className="flex flex-col items-center justify-start space-y-3 border-b bg-background px-4 py-6 pt-8  md:px-8">
          {/* <a href={siteConfig.url}>
            <Icons.logo className="size-10" />
          </a> */}
          <h3 className="font-urban text-2xl font-bold">Select Wallet</h3>
            <div className="grid grid-cols-3 w-full">
          <button className="flex flex-col justify-center items-center hover:opacity-70 transition-opacity gap-1 ">
                <div className="flex justify-center items-center w-14 h-14 border-[1px] border-white/20 bg-[#181818] rounded-xl">
            <Image src="https://app.liquidium.fi/static/media/xverse_icon_whitecolor.f02ac6d5ccdee9b226d9934b4aef555a.svg" alt="Xverse wallet" className="w-6 h-6" width={24} height={24} />

            </div>
            <p className="font-semibold sm:text-lg text-base ">Xverse</p>
            </button>
            </div>
          <p className="text-sm text-gray-500">
          By connecting a wallet, you agree to UTXO.dev Terms of Service and consent to its Privacy Policy.
          </p>
        </div>

        <div className="flex flex-col space-y-4 bg-secondary/10 px-4 py-4 md:px-16">
          <Button
            variant="default"
            disabled={walletClicked}
            onClick={() => {
            //   setWalletClicked(true);
            walletModal.onClose();

            }}
          >
            {/* {walletClicked ? (
              <Icons.spinner className="mr-2 size-4 animate-spin" />
            ) : (
            //   <Icons.google className="mr-2 size-4" />
            
            )}{" "} */}

            CLose
            
          </Button>
        </div>
      </div>
    </Modal>
  );
};