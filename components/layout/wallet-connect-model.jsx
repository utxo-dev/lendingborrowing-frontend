"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getAddress, AddressPurpose, BitcoinNetworkType } from 'sats-connect'
import { Icons } from "@/components/shared/icons";
import { Modal } from "@/components/shared/modal";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { useWalletModal } from "@/hooks/use-wallet-model";
import { useWalletAddress } from "@/hooks/use-wallet-address"

import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation";



export const WalletModal = () => {
  const router = useRouter();
  const walletModal = useWalletModal();
  const walletAddress = useWalletAddress();

  const { toast } = useToast()
  const [walletClicked, setWalletClicked] = useState(false);

  // let [ paymentsAddress, setPaymentsAddress ] = useState();
  // let [ paymentsPublicKey, setPaymentsPublicKey ] = useState();
  // let [ ordinalsAddress, setOrdinalsAddress ] = useState();
  // let [ ordinalsPublicKey, setOrdinalsPublicKey ] = useState();

  // useEffect(() => {

  //   setPaymentsAddress(localStorage.getItem("paymentsAddress"))
  //   setPaymentsPublicKey(localStorage.getItem("paymentsPublicKey"))
  //   setOrdinalsAddress(localStorage.getItem("ordinalsAddress"))
  //   setOrdinalsPublicKey(localStorage.getItem("ordinalsPublicKey"))

  // })

  function onConnect(
    paymentsAddress_, 
    paymentsPublicKey_, 
    ordinalsAddress_,
    ordinalsPublicKey_
  ) {

    walletAddress.updatePaymentAddress(paymentsAddress_)
      localStorage.setItem("paymentsAddress", paymentsAddress_)
      walletAddress.updatePaymentPublicKey(paymentsPublicKey_)
      localStorage.setItem("paymentsPublicKey", paymentsPublicKey_)
      walletAddress.updateOrdinalAddress(ordinalsAddress_)
      localStorage.setItem("ordinalsAddress", ordinalsAddress_)
      walletAddress.updateOrdinalPublicKey(ordinalsPublicKey_)
      localStorage.setItem("ordinalsPublicKey", ordinalsPublicKey_)
      // router.reload();

  }

  const getAddressOptions = {
    payload: {
        purposes: [AddressPurpose.Payment, AddressPurpose.Ordinals],
        message: 'Address for receiving Ordinals and payments',
        network: {
            type: BitcoinNetworkType.Testnet
        },
    },
    onFinish: (response) => {
        console.log(response)

        onConnect(
            response.addresses[0].address,
            response.addresses[0].publicKey,
            response.addresses[1].address,
            response.addresses[1].publicKey
        );
        toast({
            title: "Wallet Connected",
            description: (
                <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
                    <code className="text-white">Address :- {response.addresses[0].address}</code>
                </pre>
            )
        })
    },
    onCancel: ()=> { 
        
        toast({
            title: "Request canceled",
            variant: "destructive"
            
        })
        },
}

function onXverseConnect() {
    walletModal.onClose();
    getAddress(getAddressOptions)
}

  return (
    <Modal showModal={walletModal.isOpen} setShowModal={walletModal.onClose}>
      <div className="w-full">
        <div className="flex flex-col items-center justify-start space-y-3 border-b bg-background px-4 py-6 pt-8  md:px-8">
          {/* <a href={siteConfig.url}>
            <Icons.logo className="size-10" />
          </a> */}
          <h3 className="font-urban text-2xl font-bold">Select Wallet</h3>
            <div className="grid grid-cols-3 w-full">
          <button onClick={onXverseConnect} className="flex flex-col justify-center items-center hover:opacity-70 transition-opacity gap-1 ">
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