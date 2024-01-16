"use client";
import { ReloadIcon } from "@radix-ui/react-icons"
import { useState, useEffect } from "react";
import Image from "next/image";
import { getAddress, AddressPurpose, BitcoinNetworkType } from 'sats-connect'
import { Icons } from "@/components/shared/icons";
import { Modal } from "@/components/shared/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"


import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { siteConfig } from "@/config/site";
import { useBorrowSheetModal } from "@/hooks/use-borrow-sheet-model";
import { useWalletAddress } from "@/hooks/use-wallet-address"
import { useSuccessModal } from "@/hooks/use-success-model";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "@/components/ui/use-toast"
import { env } from "@/env.mjs";
import { useToast } from "@/components/ui/use-toast"
import { Buff } from '@cmdcode/buff-utils'
import { gen_seckey, get_seckey, get_pubkey } from '@cmdcode/crypto-utils/keys'
import { Address, Signer, Tap, Tx, } from '@cmdcode/tapscript'
import { signTransaction } from 'sats-connect'
import * as btc from 'micro-btc-signer'
import { hex, base64 } from '@scure/base'
import { isEmpty } from "@/lib/utils";

const bitcoinTestnet = {
    bech32: 'tb',
    pubKeyHash: 0x6f,
    scriptHash: 0xc4,
    wif: 0xef,
}

const CONTRACT_ADDRESS = env.NEXT_PUBLIC_TESTNET_CONTRACT_ADDRESS;
const FEES = 2000;
const frog_inscriptions = [
    "7b608a26c3ae1dfe7839cf428c817bf705172e2f2cb0f1ec21ce054849dffc8ci0",
    "8bfd7db20b07c67a8aecc58fa45f8e42d696ab329c8c095446d6c399411aec6di0",
    "d3a21da02e21df88caabd4e725dd18549c5bb4c21b8c7c178616e0f9ef9c828ai0",
    "1eb1cdfbc28879661443770d88a20f88b703591e6008fcf3055214c6d7f3fa0di0",
    "69ca8a1f0d182c80bacc6c8432607dec468d92e0dd07097dd82b54398d2aa64bi0"
];

var BASE64_MARKER = ';base64,';

const FormSchema = z.object({
    check: z.boolean().default(false).optional(),
})

export const BorrowModal = () => {

    const [once, setOnce] = useState(false);

    const borrowModel = useBorrowSheetModal();
    const walletAddress = useWalletAddress();
    const successModel = useSuccessModal();
    const [inscriptions, setInscriptions] = useState([]);
    const [isLoading, setIsLoading] = useState();

    const get_inscription_utxo = async (inscription_id) => {

        const response = await fetch(`https://testnet.ordinals.com/inscription/${inscription_id}`);

        const html = await response.text();

        // Regex pattern
        let regexPattern = /<dt>output<\/dt>\s*<dd><a class=monospace href=\/output\/([^>]+)>([^<]+)<\/a><\/dd>/;

        // Match the regex pattern in the HTML
        let match = html.match(regexPattern);

        const txid = match[1].split(":")[0];
        const vout = parseInt(match[1].split(":")[1])

        // Regex pattern
        regexPattern = /<dt>output value<\/dt>\s*<dd>([^<]+)<\/dd>/;

        // Match the regex pattern in the HTML
        match = html.match(regexPattern);

        const value = parseInt(match[1]); // Extracted href value

        console.log(txid, vout, value)

        return {
            txid,
            vout,
            value
        }

    }

    const getCollectionUTXOs = async () => {

        const response = await fetch("https://oracle.utxo.dev", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            body: JSON.stringify({
                "jsonrpc": "2.0",
                "id": "id",
                "method": "get_wallet_inscriptions",
                "params": {
                    "wallet_address": walletAddress.ordinalsAddress
                }
            }),
        });

        const result = await response.json();

        return JSON.parse(result.result).map((val) => JSON.parse(val))

    }

    useEffect(() => {
        getCollectionUTXOs().then((val) => {
            setInscriptions(val.filter(val => val.inscriptions.length > 0).map(val => val.inscriptions[0]).filter((val) => frog_inscriptions.includes(val)))
        })
    }, [])

    const form = useForm({
        defaultValues: {
            check: [],
        },
    })

    function convertDataURIToBinary(dataURI) {
        var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
        var base64 = dataURI.substring(base64Index);
        var raw = window.atob(base64);
        var rawLength = raw.length;
        var array = new Uint8Array(new ArrayBuffer(rawLength));

        for (let i = 0; i < rawLength; i++) {
            array[i] = raw.charCodeAt(i);
        }
        return array;
    }

    async function inscribe() {

        const imgdata = convertDataURIToBinary("data:image/jpeg;base64,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")

        // The 'marker' bytes. Part of the ordinal inscription format.
        const marker = Buff.encode('ord')
        /* Specify the media type of the file. Applications use this when rendering 
        * content. See: https://developer.mozilla.org/en-US/docs/Glossary/MIME_type 
        */
        const mimetype = Buff.encode('image/png')
        // Create a keypair to use for testing.
        // Configure a demo keypair and message.
        const seckey = get_seckey("d36149dc0619b46787d3a3c9bc43c59e2f993fce26ef261033f9f2d6b8da85b0")
        const pubkey = get_pubkey(seckey, true)
        console.log('seckey:', seckey, seckey.hex)
        console.log('pubkey:', pubkey.hex)
        // Basic format of an 'inscription' script.
        const script = [pubkey, 'OP_CHECKSIG', 'OP_0', 'OP_IF', marker, '01', mimetype, 'OP_0', imgdata, 'OP_ENDIF']
        // For tapscript spends, we need to convert this script into a 'tapleaf'.
        const tapleaf = Tap.encodeScript(script)
        // Generate a tapkey that includes our leaf script. Also, create a merlke proof 
        // (cblock) that targets our leaf and proves its inclusion in the tapkey.
        const [tpubkey, cblock] = Tap.getPubKey(pubkey, { target: tapleaf })
        // A taproot address is simply the tweaked public key, encoded in bech32 format.
        const address = Address.p2tr.fromPubKey(tpubkey, 'testnet')

        console.log("send btc to this address ", address)

        let payment_utxos = await getPaymentUTXOs(10_000 + FEES);

        const publicKey = hex.decode(walletAddress.paymentsPublicKey);
        const p2wpkh = btc.p2wpkh(publicKey, bitcoinTestnet);
        const p2sh = btc.p2sh(p2wpkh, bitcoinTestnet);

        const internalPubKey = hex.decode(walletAddress.ordinalsPublicKey);
        const p2tr = btc.p2tr(internalPubKey, undefined, bitcoinTestnet)

        const tx = new btc.Transaction();

        payment_utxos.forEach((utxo) => {

            tx.addInput({
                txid: utxo.txid,
                index: utxo.vout,
                witnessUtxo: {
                    script: p2sh.script,
                    amount: BigInt(utxo.value),
                },
                redeemScript: p2sh.redeemScript,
            })

        })

        tx.addOutputAddress(address, BigInt(10_000), bitcoinTestnet)
        tx.addOutputAddress(walletAddress.paymentsAddress, BigInt(payment_utxos.reduce((previousValue, currentValue) => previousValue + currentValue.value, 0) - 10_000 - FEES), bitcoinTestnet)

        console.log(tx)

        const psbt = tx.toPSBT(0)
        const psbtBase64 = base64.encode(psbt)


        const signPsbtOptions = {
            payload: {
                network: {
                    type: 'Testnet'
                },
                message: 'Sign Transaction',
                psbtBase64: psbtBase64,
                broadcast: true,
                inputsToSign: [{
                    address: walletAddress.paymentsAddress,
                    signingIndexes: Array.from(Array(payment_utxos.length).keys()),
                }],
            },
            onFinish: async (response) => {

                console.log(response.txId)

                const txdata = Tx.create({
                    vin: [{
                        // Use the txid of the funding transaction used to send the sats.
                        txid: response.txId,
                        // Specify the index value of the output that you are going to spend from.
                        vout: 0,
                        // Also include the value and script of that ouput.
                        prevout: {
                            // Feel free to change this if you sent a different amount.
                            value: 10_000,
                            // This is what our address looks like in script form.
                            scriptPubKey: ['OP_1', tpubkey]
                        },
                    }],
                    vout: [{
                        // We are leaving behind 1000 sats as a fee to the miners.
                        value: 500,
                        // This is the new script that we are locking our funds to.
                        scriptPubKey: Address.toScriptPubKey(walletAddress.ordinalsAddress)
                    }]
                })

                console.log(txdata)

                // For this example, we are signing for input 0 of our transaction,
                // using the untweaked secret key. We are also extending the signature 
                // to include a commitment to the tapleaf script that we wish to use.
                const sig = Signer.taproot.sign(seckey, txdata, 0, { extension: tapleaf })

                // Add the signature to our witness data for input 0, along with the script
                // and merkle proof (cblock) for the script.
                txdata.vin[0].witness = [sig, script, cblock]

                // Check if the signature is valid for the provided public key, and that the
                // transaction is also valid (the merkle proof will be validated as well).
                const isValid = await Signer.taproot.verify(txdata, 0, { pubkey, throws: true })

                // You can publish your transaction data using 'sendrawtransaction' in Bitcoin Core, or you 
                // can use an external API (such as https://mempool.space/docs/api/rest#post-transaction).
                const txHex = Tx.encode(txdata).hex;

                if (isValid) console.log(txHex);
                else console.log('err')

            },
            onCancel: () => alert('Canceled'),
        }

        await signTransaction(signPsbtOptions);

        /* NOTE: To continue with this example, send 100_000 sats to the above address.
        * You will also need to make a note of the txid and vout of that transaction,
        * so that you can include that information below in the redeem tx.
        */

        const txdata = Tx.create({
            vin: [{
                // Use the txid of the funding transaction used to send the sats.
                txid: 'd3632ae8999b4bef9c2a4520bd090eba8144c15b8653be7552edb477a4640e06',
                // Specify the index value of the output that you are going to spend from.
                vout: 0,
                // Also include the value and script of that ouput.
                prevout: {
                    // Feel free to change this if you sent a different amount.
                    value: 6_500,
                    // This is what our address looks like in script form.
                    scriptPubKey: ['OP_1', tpubkey]
                },
            }],
            vout: [{
                // We are leaving behind 1000 sats as a fee to the miners.
                value: 500,
                // This is the new script that we are locking our funds to.
                scriptPubKey: Address.toScriptPubKey('tb1p6srjdmnt07uwhp2k40vdrve75wszu37kacnge353fd64uavkc0dsfvjkfv')
            }]
        })

        // For this example, we are signing for input 0 of our transaction,
        // using the untweaked secret key. We are also extending the signature 
        // to include a commitment to the tapleaf script that we wish to use.
        const sig = Signer.taproot.sign(seckey, txdata, 0, { extension: tapleaf })

        // Add the signature to our witness data for input 0, along with the script
        // and merkle proof (cblock) for the script.
        txdata.vin[0].witness = [sig, script, cblock]

        // Check if the signature is valid for the provided public key, and that the
        // transaction is also valid (the merkle proof will be validated as well).
        const isValid = await Signer.taproot.verify(txdata, 0, { pubkey, throws: true })

        // You can publish your transaction data using 'sendrawtransaction' in Bitcoin Core, or you 
        // can use an external API (such as https://mempool.space/docs/api/rest#post-transaction).
        console.log('Your txhex:', Tx.encode(txdata).hex)
        console.dir(txdata, { depth: null })

    }
    /*
        useEffect(() => {
            inscribe()
        })
    */
    const getPaymentUTXOs = async (value) => {

        let response = await fetch(`https://mempool.space/testnet/api/address/${walletAddress.paymentsAddress}/utxo`)
        let utxos = await response.json();

        let sorted_utxos = utxos.filter((value) => {
            return value.status.confirmed
        }).sort(function (a, b) {
            return b.value - a.value;
        })

        let result = []
        for (let i = 0; i < sorted_utxos.length; i++) {
            result.push(sorted_utxos[i])
            let sum = result.map((utxo) => { return utxo.value }).reduce((total, num) => { return total + num }, 0)
            if (sum > value) {
                break;
            }
        }

        return result

    }

    const getOrdinalsUTXOs = async (value) => {

        let response = await fetch(`https://mempool.space/testnet/api/address/${walletAddress.ordinalsAddress}/utxo`)
        let utxos = await response.json();

        let sorted_utxos = utxos.filter((value) => {
            return value.status.confirmed
        }).sort(function (a, b) {
            return b.value - a.value;
        })

        let result = []
        for (let i = 0; i < sorted_utxos.length; i++) {
            result.push(sorted_utxos[i])
            let sum = result.map((utxo) => { return utxo.value }).reduce((total, num) => { return total + num }, 0)
            if (sum > value) {
                break;
            }
        }

        return result

    }

    async function take_bid(inscription_id, inscription_utxo, fee_utxo) {

        const response = await fetch("https://oracle.utxo.dev", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            body: JSON.stringify({
                "jsonrpc": "2.0",
                "id": "id",
                "method": "call_contract",
                "params": {
                    "method_name": "take_bid",
                    "instruction_data": `{
                        \"fee_utxo\": {
                            \"txid\": \"${fee_utxo.txid}\",
                            \"vout\": ${fee_utxo.vout},
                            \"value\": ${fee_utxo.value},
                            \"owner\": \"${CONTRACT_ADDRESS}\"
                        },
                        \"collection\":\"frogs\",
                        \"inscription\": {
                            \"inscription_id\": \"${inscription_id}\",
                            \"utxo\": {
                                \"txid\": \"${inscription_utxo.txid}\",
                                \"vout\": ${inscription_utxo.vout},
                                \"value\": ${inscription_utxo.value},
                                \"owner\": \"${CONTRACT_ADDRESS}\"
                            }
                        },
                        \"borrower_ordinals_address\": \"${walletAddress.ordinalsAddress}\",
                        \"borrower_payments_address\": \"${walletAddress.paymentsAddress}\"
                    }`
                }
            }),
        });

        const result = await response.json();

        return result.result

    }

    async function onSubmit(data) {
        console.log("submit", data)

        let inscription_id = data.check[0];

        let fees_utxos = await getPaymentUTXOs(FEES + FEES);

        const publicKey = hex.decode(walletAddress.paymentsPublicKey);
        const p2wpkh = btc.p2wpkh(publicKey, bitcoinTestnet);
        const p2sh = btc.p2sh(p2wpkh, bitcoinTestnet);

        const internalPubKey = hex.decode(walletAddress.ordinalsPublicKey);
        const p2tr = btc.p2tr(internalPubKey, undefined, bitcoinTestnet)

        const tx = new btc.Transaction();

        let ordinals_utxo = await get_inscription_utxo(inscription_id);

        tx.addInput({
            txid: ordinals_utxo.txid,
            index: ordinals_utxo.vout,
            witnessUtxo: {
                script: p2tr.script,
                amount: BigInt(ordinals_utxo.value),
            },
            tapInternalKey: internalPubKey,
            sighashType: btc.SignatureHash.DEFAULT
        })

        fees_utxos.forEach((utxo) => {

            tx.addInput({
                txid: utxo.txid,
                index: utxo.vout,
                witnessUtxo: {
                    script: p2sh.script,
                    amount: BigInt(utxo.value),
                },
                redeemScript: p2sh.redeemScript,
            })

        })

        tx.addOutputAddress(CONTRACT_ADDRESS, BigInt(ordinals_utxo.value), bitcoinTestnet)
        tx.addOutputAddress(CONTRACT_ADDRESS, BigInt(FEES), bitcoinTestnet)
        tx.addOutputAddress(walletAddress.paymentsAddress, BigInt(fees_utxos.reduce((previousValue, currentValue) => previousValue + currentValue.value, 0) - FEES - FEES), bitcoinTestnet)

        const psbt = tx.toPSBT(0)
        const psbtBase64 = base64.encode(psbt)


        const signPsbtOptions = {
            payload: {
                network: {
                    type: 'Testnet'
                },
                message: 'Sign Transaction',
                psbtBase64: psbtBase64,
                broadcast: true,
                inputsToSign: [{
                    address: walletAddress.ordinalsAddress,
                    signingIndexes: [0],
                }, {
                    address: walletAddress.paymentsAddress,
                    signingIndexes: Array.from(Array(fees_utxos.length).keys()).map(val => val + 1),
                }],
            },
            onFinish: (response) => {
                setIsLoading(true);

                let inscription_utxo = {
                    txid: response.txId,
                    vout: 0,
                    value: 500
                }
                let fee_utxo = {
                    txid: response.txId,
                    vout: 1,
                    value: FEES
                }
                /*
                                let inscription_id = "971aeb2889c75d8eaddec643c5558917717145e5ea1f813260652b39d31e11ffi0"
                                let bid_id = "1a3fb69a94d12f84eb0faa1fe1b94941e7253cf615f1b8dfd5d87c47491e6f22:0"
                */
                take_bid(
                    inscription_id,
                    inscription_utxo,
                    fee_utxo
                ).then((txid) => {
                    setIsLoading(false);
                    borrowModel.onClose();
                    successModel.updateTxId(txid)
                    successModel.onOpen()

                    console.log("Transaction id ", txid)

                })

            },
            onCancel: () => {
                setIsLoading(false);
                alert('Canceled')
            },
        }

        await signTransaction(signPsbtOptions);
    }

    return (
        <Modal showModal={borrowModel.isOpen} setShowModal={borrowModel.onClose}>
            <div className="w-full">
                <Card className="   rounded-2xl flex flex-col  border bg-card text-card-foreground shadow">

                    <CardHeader>
                        <CardTitle>
                            <div className="flex gap-4 ">
                                <img src="https://firebasestorage.googleapis.com/v0/b/liquidium-dev.appspot.com/o/collections%2Fbitcoin-frogs.webp?alt=media&amp;token=e72eb645-0a9d-44ee-9727-d2c83552ffb6" alt="" className="w-[66px] h-[66px] rounded-xl" width={"66"} />
                                <div className="flex flex-col w-full justify-between &quot; py-1"><div className="flex items-center gap-1 justify-between w-full ">
                                    <p className="sm:text-2xl text-xl font-extrabold leading-5">Bitcoin Frogs</p>
                                    <a className="bg-[#f72c87] flex justify-center items-center p-[6px] rounded-md hover:opacity-80 cursor-pointer" target="_blank" rel="noreferrer" href="https://magiceden.io/ordinals/marketplace/bitcoin-frogs">
                                        <img className="h-3" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAAyCAYAAADLLVz8AAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAATNSURBVHgB7ZqPVSJJEMarelh1BDyJ4LgIzotgMQOMYDGCcyNYiOD2IliMQC8CvQjECJaLQA4GBmXouqqRuce6CkxP9zC8t7/3VPzDTPtNddXX1Y2wRDAMWwrhgwY6QcBjAOwBUk950PF9vw9b4vtxbQvseQhd8uivRA+UT0R0HAbTKwJovPVWBartV/c7kCObjGsrIPQ5qE5FxFjAySi82WSQeYs4Hk2ueLRNKCIs4tPs4Dcl02PTJ6xBt8PR4yfIgXF8n4KKJxDU90rTC5yMphx91EjzXteRGIZhXUfwFYoORyGORyGBAa5ElLw3GU/v5AnDDqDAEFfTmfPe510Rj0NwYCygYFvESTD9HVF9gB0B2eIZT+FlbExnyXvziO626/PSwdF3mikCE2xEop7DzS6Jx3T8qn9rRUAhi4ixZdmZvEcDQvpYrvpt+c7KFF4m7XQWH4oIX8ARfO0+EVyCBYjm/fK8fI01HPx/fdsCCpuKGPs9nrpOo2+xYqgt/dM2sTaFl5HpPA7CtVHFRePa+dTl6++XplfgCCcCxhC0VokoeY+Lxq+QA7JUnQSTP8AB7gQU3hAxHIUNjtM2pIbuJaeBAUR44cL4O8mB398FuuWKfy4vTfOeCIczOJXXukR3YGh5FHotv7JnpajE14M8WIrE+YwjzyDv6dn8zK/5ffnQgGdgiCb9OQieTsAS+UTgAu76DAzNcifxXQnBv9xKUmSW15YaopCRXAU0A6/L1YNXI240Cts8hczymiV7k34Ko+qaJvLUt5JIiejjW7+vclQSabN8Jg3Rd9PMlTm1gAT67+dkTj1wTJL3Vv3NbP50YTwWzs3PjsAcoyIi/9RT9OhaxE6lVll7/VqtNlARnpnOCp1xw8q4CsvA3Ykoee/borEKeaCLWZE+nxFlqsiZbIwLEdflvTc5ACNQ4U+Qgcw+0LaIc4LzdXnv1ffJutrAImmie8iAFSNtUcQOV9ZbSEmWdbXH6QIyYG0lklVERLxNk/cSxsPHptm6GmJL5hs8sGWsLuVMRXxe59I5pETW1aC0kZeLc+1MZ96Wtb4WNhFxE7/3Gub9RF5SctU2uedLnDQTUoq4kd97SaZ+InnnNsQTnHVjEhHX7Ed0TPKeeT9xcc+j/UyFY5kSOERE5C8tXvR3OVqaCiGOGE1wz52Za5OKu+gnfgGzFojRA1uFUwETFkLdggUoinfw6pCauKvTBsvk01C1hOQ9k8OWUnEPo/3UVX4TdkbA2LIY5L1kKwAdbWvmMoWzsjjydgMG8GbSQHtRIxgGkBUPvf5L470TAoZBvJtWByPoBNGzcvKBW1/Aezt90my9jvyu/KzwU1gsC1fsCygKbNzlKEqyRVp4AbXDczNZeD5MFTYKLeBwOG4W+dQWO4JPqQXUWjupZq/BgyvuKX2GEOqpBXyHKj8B0fsZCo6CFJsx4qmy9s/SwPblHygwCNwS0ykOH9o6qLgpXEC6UGC0hkt8eHg43ivtf123nxAvhyr+L5AzwXDcLebJfbovVw9PlHRMCPXpqn1VabcnJ6PypnJUbmmgP6FAiB6Hkd+IXyc/DB/C+tyDtlLwnhbWQf5Qa7pMXPc2icenqKlK6j37h2M213XIFRwoxF6k9WU1xzrwgx+s5j+VtIUzuxUSMAAAAABJRU5ErkJggg==" alt="" width={"24"} /></a>
                                </div>
                                    <div>
                                        <p className="text-sm font-semibold">Total Volume: 1009.73 BTC</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-5">
                                <div className="w-full grid grid-cols-3 grid-rows-1 gap-2.5" >
                                    <div className="p-3 rounded-xl border border-black/20">
                                        <p className="font-medium sm:text-sm text-xs">Floor</p>
                                        <div className="flex font-bold text-sm sm:text-base mt-1">
                                            <Image src="https://app.liquidium.fi/static/media/btcSymbol.371279d96472ac8a7b0392d000bf4868.svg" alt="BTC Symbol" className="mr-1 h-5 sm:h-6" width={"24"} height={"24"} />
                                            <p className="text-black">0.264</p>
                                            <p className=" "></p>
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-xl border border-black/20">
                                        <p className=" font-medium sm:text-sm text-xs">Duration</p>
                                        <div className="flex font-bold text-sm sm:text-base mt-1">
                                            <p className="text-black">16</p><p className=" ml-1">Days</p>
                                        </div></div><div className="p-3 rounded-xl border border-black/20">
                                        <p className=" font-medium sm:text-sm text-xs">APY</p>
                                        <div className="flex font-bold text-sm sm:text-base mt-1">
                                            <p className="text-black">90</p>
                                            <p className="text-black ">%</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>

                        <p className="text-2xl font-bold  mt-8">Collateral</p>

                        <div className="mt-4">


                            {
                                isEmpty(inscriptions) ? (
                                    <div className="w-full bg-gray-100 rounded-xl px-4 py-3">
                                        <div className="flex sm:flex-row flex-col items-center gap-2 justify-between ">
                                            <div className="flex  items-center gap-2">
                                                <p className="sm:text-sm text-xs text-black font-semibold">No Bitcoin Frogs Available</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <></>
                                )
                            }


                        </div>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div className="space-y-8 my-8">
                                    <div className="flex items-center">
                                        {
                                            inscriptions.map((inscription_id) => {
                                                return (
                                                    <div key={inscription_id} className=" pt-0 grid gap-6">
                                                        <div className="flex items-center justify-between space-x-4">
                                                            <div className="flex items-center space-x-4">
                                                                <Avatar key={inscription_id} className="flex h-9 w-9 items-center justify-center space-y-0 border">
                                                                    <AvatarImage key={inscription_id} src="https://ord-mirror.magiceden.dev/content/b54fae7448c2efe2b2adf90d0b753180794ce2b29692cc2278b73440fdb86a8ci0" alt="Avatar" />
                                                                    <AvatarFallback key={inscription_id}>BF</AvatarFallback>
                                                                </Avatar>
                                                                <div key={inscription_id} className="ml-4 space-y-1">
                                                                    <p key={inscription_id} className="text-sm font-medium leading-none">Bitcoin Frog
                                                                    </p>
                                                                    <p key={inscription_id} className="text-sm text-muted-foreground">#2670</p>
                                                                </div>
                                                            </div>
                                                            <div key={inscription_id} className="ml-auto font-medium">
                                                                <FormField
                                                                    key={inscription_id}
                                                                    control={form.control}
                                                                    name="check"
                                                                    render={({ field }) => (
                                                                        <FormItem key={inscription_id} className="flex flex-row items-start space-x-3 space-y-0 rounded-md  p-4 ">
                                                                            <FormControl key={inscription_id}>
                                                                                <Checkbox
                                                                                    disabled={isLoading}
                                                                                    key={inscription_id}
                                                                                    checked={field.value?.includes(inscription_id)}
                                                                                    // onCheckedChange={field.onChange}
                                                                                    onCheckedChange={(checked) => {
                                                                                        return checked
                                                                                            ? field.onChange([...field.value, inscription_id])
                                                                                            : field.onChange(
                                                                                                field.value?.filter(
                                                                                                    (value) => value !== inscription_id
                                                                                                )
                                                                                            )
                                                                                    }}
                                                                                />
                                                                            </FormControl>

                                                                        </FormItem>
                                                                    )}
                                                                />

                                                            </div>

                                                        </div>
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>
                                </div>

                                <div className="flex flex-row justify-between space-x-2">
                                    <Button
                                        variant="outline"
                                        type="button"
                                        className={"w-full"}
                                        disabled={isLoading}
                                        onClick={borrowModel.onClose}
                                    >
                                        Close
                                    </Button>

                                    {
                                        !walletAddress.ordinalsAddress ? (

                                            <></>

                                        ) : (<Button type="submit" variant="default" className={"w-full"} disabled={isLoading}>
                                            {
                                                isLoading ? <>
                                                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                                                    Please wait...
                                                </> : <>Borrow</>
                                            }
                                        </Button>)
                                    }



                                </div>

                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </Modal>
    );
};