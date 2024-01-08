"use client"

import { getAddress, AddressPurpose, BitcoinNetworkType } from 'sats-connect'

import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function Connect({ onConnect }) {

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
            )
        },
        onCancel: () => alert('Request canceled'),
    }

    function onXverseConnect() {
        getAddress(getAddressOptions)
    }

    async function onUnisatConnect() {
        if (typeof window.unisat !== 'undefined') {
            await window.unisat.requestAccounts()

            onConnect(
                null,
                null,
                (await window.unisat.getAccounts())[0],
                await window.unisat.getPublicKey()
            )

        } else {
            alert('Make sure to install Unisat first')
        }
    }

    return (
        <div className="flex items-center h-screen">
            <Dialog>
                <DialogTrigger className="mx-auto" asChild>
                    <div className="flex items-center">
                        <Button variant="default">
                            Connect
                        </Button>
                    </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Connect a wallet to continue</DialogTitle>
                    <DialogDescription>
                        Choose how you want to connect. If you don&apos;t have a wallet, you can select a provider and create one.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Button 
                        variant="outline" 
                        className="py-6"
                        onClick={onXverseConnect}
                    >
                        <img className="bg-[#1B1828] rounded-[25%] p-1" width='30px' height='30px' alt="xverse" src="https://ord.cdn.magiceden.dev/static_resources/wallet_logos/xverse.png" />
                        <Label className="ml-6 text-xl font-bold">Xverse</Label>
                    </Button>
                    <Button 
                        variant="outline" 
                        className="py-6"
                        onClick={onUnisatConnect}
                    >
                        <img className="bg-[#1B1828] rounded-[25%] p-1" width='30px' height='30px' alt="xverse" src="https://ord.cdn.magiceden.dev/static_resources/wallet_logos/unisat.png" />
                        <Label className="ml-6 text-xl font-bold">Unisat</Label>
                    </Button>
                </div>
                </DialogContent>
            </Dialog>
        </div>
    )


}