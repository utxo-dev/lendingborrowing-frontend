'use client'
import React, { useCallback, useEffect } from "react"

import { CheckCircle2Icon } from "lucide-react";
import { Link1Icon, DiscordLogoIcon, TwitterLogoIcon } from "@radix-ui/react-icons"
import { Modal } from "@/components/shared/modal";
import { useSuccessModal } from "@/hooks/use-success-model";
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import Link from "next/link"
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useToast } from "@/components/ui/use-toast"
import { Player } from '@lottiefiles/react-lottie-player';




export const SuccessModel = () => {
    const successModel = useSuccessModal();
    const { toast } = useToast()

    const onCopy = useCallback(() => {
        toast({
            title: "Link Copied",
            description: "",

        })
    }, [])

    useEffect(() => {
        if (!successModel.transactionId) {
            successModel.onClose();
        }

        return () => {
            console.log("cleaned up");
            successModel.updateTxId(null)
        };
    }, []);


    return (
         <Modal showModal={successModel.isOpen} setShowModal={successModel.onClose}>
            <div className="w-full">
                <Card className="   rounded-2xl flex flex-col   bg-card text-card-foreground ">

                    <CardHeader>
                        <CardTitle className="flex flex-col justify-center items-center pt-6 font-semibold tracking-tight text-2xl">
                            Success


                        </CardTitle>
                        <CardDescription className="flex flex-col justify-center items-center ">
                            {/* <CheckCircle2Icon width="42" height="42" className="text-green-500 " />
                             */}
                            <Player
                                src='/success-message.json'
                                className="player"
                                loop
                                autoplay
                                style={{ height: '150px', width: '150px' }}
                            />

                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col">
                            <p className="text-sm text-muted-foreground pb-2"> Share your offer</p>
                            <div className="flex flex-row justify-between space-x-2">
                                <Button
                                    variant="outline"
                                    className={"w-full bg-[#00ACEE] hover:bg-[#00ACEE]/90 hover:text-white text-white"}
                                    type="button"
                                    asChild

                                >
                                    <Link href="https://twitter.com/utxolabs" passHref={true} rel="noreferrer" target="_blank">  <TwitterLogoIcon className="mr-2" />   Tweet! </Link>
                                </Button>
                                <Button
                                    // variant="ghost"
                                    className={"w-full bg-[#5865F2]  hover:bg-[#5865F2]/90 hover:text-white text-white"}
                                    type="button"
                                    asChild

                                >


                                    <Link rel="noreferrer" target="_blank" href="https://discord.gg/gkE6pWJX" passHref={true}>     <DiscordLogoIcon className="mr-2" />   Discord </Link>
                                </Button>

                                <Button

                                    className={"w-full"}
                                    type="button"
                                    asChild

                                >
                                    <Link rel="noreferrer" target="_blank" href={`https://mempool.space/testnet/tx/`+successModel.transactionId} passHref={true}>         <Link1Icon className="mr-2" />  Copy Link </Link>
                                </Button>

                            </div>
                        </div>
                        <Separator className="my-4" />
                    </CardContent>



                    <CardFooter className="w-full">

                        <div className="flex flex-row justify-between space-x-2 w-full">
                            <Button
                                variant="outline"
                                className={"w-full"}
                                type="button"
                                onClick={successModel.onClose}
                            >
                                Close
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>

        </Modal>
    )
}