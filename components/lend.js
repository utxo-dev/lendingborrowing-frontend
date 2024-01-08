"use client"

import { useState, useEffect } from "react"

import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
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
import { Input } from "@/components/ui/input"
import Connect from "@/components/connect"
import { signTransaction } from 'sats-connect'
import * as btc from 'micro-btc-signer'
import { hex, base64 } from '@scure/base'

const CONTRACT_ADDRESS = "tb1p33z9l755s9f4a26g59jpxw3lctu8uxe7keszm2w32wk6xreccgdq9f50l2";
const FEES = 1000;

const formSchema = z.object({
    offer_amount: z.number(),
    interest_amount: z.number(),
    input_plus_btc: z.number()
})

const bitcoinTestnet = {
    bech32: 'tb',
    pubKeyHash: 0x6f,
    scriptHash: 0xc4,
    wif: 0xef,
}

export default function LendingComponent() {

    let [paymentsAddress, setPaymentsAddress] = useState();
    let [paymentsPublicKey, setPaymentsPublicKey] = useState();
    let [ordinalsAddress, setOrdinalsAddress] = useState();
    let [ordinalsPublicKey, setOrdinalsPublicKey] = useState();


    useEffect(() => {

        setPaymentsAddress(localStorage.getItem("paymentsAddress"))
        setPaymentsPublicKey(localStorage.getItem("paymentsPublicKey"))
        setOrdinalsAddress(localStorage.getItem("ordinalsAddress"))
        setOrdinalsPublicKey(localStorage.getItem("ordinalsPublicKey"))

    })

    const form = useForm({
        defaultValues: {
            offer_amount: 0.0,
            interest_amount: 0.0
        },
    })

    const getPaymentUTXOs = async (value) => {

        let response = await fetch(`https://mempool.space/testnet/api/address/${paymentsAddress}/utxo`)
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

    async function bid_collection(bid_utxo, fee_utxo, loan_value, loan_period) {

        const response = await fetch("https://oracle.utxo.dev", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "jsonrpc":"2.0",
                "id":"id",
                "method":"call_contract",
                "params": {
                    "method_name": "bid_collection",
                    "instruction_data": `{
                        \"fee_utxo\": {
                            \"txid\": \"${fee_utxo.txid}\",
                            \"vout\": ${fee_utxo.vout},
                            \"value\": ${fee_utxo.value},
                            \"owner\": \"${CONTRACT_ADDRESS}\"
                        },
                        \"collection\":\"frogs\",
                        \"utxo\": {
                            \"txid\": \"${bid_utxo.txid}\",
                            \"vout\": ${bid_utxo.vout},
                            \"value\": ${bid_utxo.value},
                            \"owner\": \"${CONTRACT_ADDRESS}\"
                        },
                        \"loan_value\": ${loan_value},
                        \"loan_period\": ${loan_period},
                        \"lender_address\": \"${paymentsAddress}\"
                    }`
                }
            }),
        });

        const result = await response.json();

        return result.result

    }

    async function onSubmit(values) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        console.log(values)

        console.log(parseFloat(values.offer_amount), parseFloat(values.interest_amount))
        console.log(paymentsAddress, ordinalsAddress, paymentsPublicKey)

        let utxos = await getPaymentUTXOs(Math.floor(parseFloat(values.offer_amount) * 100000000) + FEES);
        console.log(utxos);

        const publicKey = hex.decode(paymentsPublicKey);
        const p2wpkh = btc.p2wpkh(publicKey, bitcoinTestnet);
        const p2sh = btc.p2sh(p2wpkh, bitcoinTestnet);

        const tx = new btc.Transaction();

        utxos.forEach((utxo) => {

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

        console.log(Math.floor(parseFloat(values.offer_amount) * 100000000), )
        
        tx.addOutputAddress(CONTRACT_ADDRESS, BigInt(Math.floor(parseFloat(values.offer_amount) * 100000000)), bitcoinTestnet)
        tx.addOutputAddress(CONTRACT_ADDRESS, BigInt(FEES), bitcoinTestnet)
        tx.addOutputAddress(paymentsAddress, BigInt(utxos.reduce((previousValue, currentValue) => previousValue + currentValue.value, 0) - Math.floor(parseFloat(values.offer_amount) * 100000000) - FEES - FEES), bitcoinTestnet)
        
        const psbt = tx.toPSBT(0)
        const psbtBase64 = base64.encode(psbt)

        const signPsbtOptions = {
            payload: {
                network: {
                    type:'Testnet'
                },
                message: 'Sign Transaction',
                psbtBase64: psbtBase64,
                broadcast: true,
                inputsToSign: [{
                    address: paymentsAddress,
                    signingIndexes: Array.from(Array(utxos.length).keys()),
                }],
            },
            onFinish: (response) => {
              
                let bid_utxo = {
                    txid: response.txId,
                    vout: 0,
                    value: Math.floor(parseFloat(values.offer_amount) * 100000000)
                }
                let fee_utxo = {
                    txid: response.txId,
                    vout: 1,
                    value: FEES
                }

                bid_collection(
                    bid_utxo, 
                    fee_utxo, 
                    Math.floor(parseFloat(values.offer_amount) * 100000000) + Math.floor(parseFloat(values.interest_amount) * 100000000),
                    30 * 24 * 60 * 60
                ).then((txid) => {
                    console.log("Transaction id ", txid)
                })

            },
            onCancel: () => alert('Canceled'),
        }
          
        await signTransaction(signPsbtOptions);

    }




    function onConnect(
        paymentsAddress_,
        paymentsPublicKey_,
        ordinalsAddress_,
        ordinalsPublicKey_
    ) {

        setPaymentsAddress(paymentsAddress_)
        localStorage.setItem("paymentsAddress", paymentsAddress_)
        setPaymentsPublicKey(paymentsPublicKey_)
        localStorage.setItem("paymentsPublicKey", paymentsPublicKey_)
        setOrdinalsAddress(ordinalsAddress_)
        localStorage.setItem("ordinalsAddress", ordinalsAddress_)
        setOrdinalsPublicKey(ordinalsPublicKey_)
        localStorage.setItem("ordinalsPublicKey", ordinalsPublicKey_)

    }

    return (
        <div className="flex items-center justify-center h-screen">
            <Card className="sm:w-[85vw] w-[100vw] max-w-[660px]   rounded-2xl flex flex-col  border bg-card text-card-foreground shadow">

                <CardHeader>
                    <CardTitle>
                        <div className="flex gap-4 ">
                            <img src="https://firebasestorage.googleapis.com/v0/b/liquidium-dev.appspot.com/o/collections%2Fbitcoin-frogs.webp?alt=media&amp;token=e72eb645-0a9d-44ee-9727-d2c83552ffb6" alt="" className="w-[66px] h-[66px] rounded-xl" />
                            <div className="flex flex-col w-full justify-between &quot; py-1">
                                <div className="flex items-center gap-1 justify-between w-full ">
                                    <p className="sm:text-2xl text-xl font-extrabold leading-5">Bitcoin Frogs</p>
                                    <a className="bg-[#f72c87] flex justify-center items-center p-[6px] rounded-md hover:opacity-80 cursor-pointer" target="_blank" rel="noreferrer" href="https://magiceden.io/ordinals/marketplace/bitcoin-frogs">
                                        <img className="h-3" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAAyCAYAAADLLVz8AAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAATNSURBVHgB7ZqPVSJJEMarelh1BDyJ4LgIzotgMQOMYDGCcyNYiOD2IliMQC8CvQjECJaLQA4GBmXouqqRuce6CkxP9zC8t7/3VPzDTPtNddXX1Y2wRDAMWwrhgwY6QcBjAOwBUk950PF9vw9b4vtxbQvseQhd8uivRA+UT0R0HAbTKwJovPVWBartV/c7kCObjGsrIPQ5qE5FxFjAySi82WSQeYs4Hk2ueLRNKCIs4tPs4Dcl02PTJ6xBt8PR4yfIgXF8n4KKJxDU90rTC5yMphx91EjzXteRGIZhXUfwFYoORyGORyGBAa5ElLw3GU/v5AnDDqDAEFfTmfPe510Rj0NwYCygYFvESTD9HVF9gB0B2eIZT+FlbExnyXvziO626/PSwdF3mikCE2xEop7DzS6Jx3T8qn9rRUAhi4ixZdmZvEcDQvpYrvpt+c7KFF4m7XQWH4oIX8ARfO0+EVyCBYjm/fK8fI01HPx/fdsCCpuKGPs9nrpOo2+xYqgt/dM2sTaFl5HpPA7CtVHFRePa+dTl6++XplfgCCcCxhC0VokoeY+Lxq+QA7JUnQSTP8AB7gQU3hAxHIUNjtM2pIbuJaeBAUR44cL4O8mB398FuuWKfy4vTfOeCIczOJXXukR3YGh5FHotv7JnpajE14M8WIrE+YwjzyDv6dn8zK/5ffnQgGdgiCb9OQieTsAS+UTgAu76DAzNcifxXQnBv9xKUmSW15YaopCRXAU0A6/L1YNXI240Cts8hczymiV7k34Ko+qaJvLUt5JIiejjW7+vclQSabN8Jg3Rd9PMlTm1gAT67+dkTj1wTJL3Vv3NbP50YTwWzs3PjsAcoyIi/9RT9OhaxE6lVll7/VqtNlARnpnOCp1xw8q4CsvA3Ykoee/borEKeaCLWZE+nxFlqsiZbIwLEdflvTc5ACNQ4U+Qgcw+0LaIc4LzdXnv1ffJutrAImmie8iAFSNtUcQOV9ZbSEmWdbXH6QIyYG0lklVERLxNk/cSxsPHptm6GmJL5hs8sGWsLuVMRXxe59I5pETW1aC0kZeLc+1MZ96Wtb4WNhFxE7/3Gub9RF5SctU2uedLnDQTUoq4kd97SaZ+InnnNsQTnHVjEhHX7Ed0TPKeeT9xcc+j/UyFY5kSOERE5C8tXvR3OVqaCiGOGE1wz52Za5OKu+gnfgGzFojRA1uFUwETFkLdggUoinfw6pCauKvTBsvk01C1hOQ9k8OWUnEPo/3UVX4TdkbA2LIY5L1kKwAdbWvmMoWzsjjydgMG8GbSQHtRIxgGkBUPvf5L470TAoZBvJtWByPoBNGzcvKBW1/Aezt90my9jvyu/KzwU1gsC1fsCygKbNzlKEqyRVp4AbXDczNZeD5MFTYKLeBwOG4W+dQWO4JPqQXUWjupZq/BgyvuKX2GEOqpBXyHKj8B0fsZCo6CFJsx4qmy9s/SwPblHygwCNwS0ykOH9o6qLgpXEC6UGC0hkt8eHg43ivtf123nxAvhyr+L5AzwXDcLebJfbovVw9PlHRMCPXpqn1VabcnJ6PypnJUbmmgP6FAiB6Hkd+IXyc/DB/C+tyDtlLwnhbWQf5Qa7pMXPc2icenqKlK6j37h2M213XIFRwoxF6k9WU1xzrwgx+s5j+VtIUzuxUSMAAAAABJRU5ErkJggg==" alt="" />
                                    </a>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">Total Volume: 1009.73 BTC</p>
                                </div>
                            </div>
                        </div>
                    </CardTitle>
                    <CardDescription>
                        <div className="mt-5">
                            <div className="w-full grid md:grid-cols-3 grid-rows-1 gap-2.5" >
                                <div className="p-3 rounded-xl border border-white/20">
                                    <p className=" font-medium sm:text-sm text-xs">Floor</p>
                                    <div className="flex font-bold text-sm sm:text-base mt-1">
                                        <img src="https://app.liquidium.fi/static/media/btcSymbol.371279d96472ac8a7b0392d000bf4868.svg" alt="BTC Symbol" className="mr-1 h-5 sm:h-6" />
                                        <p className="text-black">0.264</p>
                                        <p className=" "></p>
                                    </div>
                                </div>
                                <div className="p-3 rounded-xl border border-white/20">
                                    <p className=" font-medium sm:text-sm text-xs">Duration</p>
                                    <div className="flex font-bold text-sm sm:text-base mt-1">
                                        <p className="text-white">16</p><p className=" ml-1">Days</p>
                                    </div>
                                </div>
                                <div className="p-3 rounded-xl border border-white/20">
                                    <p className=" font-medium sm:text-sm text-xs">APY</p>
                                    <div className="flex font-bold text-sm sm:text-base mt-1">
                                        <p className="text-black">90</p>
                                        <p className="text-black ">%</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardDescription>
                </CardHeader>
                <CardContent>

                    <p className="text-2xl font-bold  mt-8">Loan Info</p>

                    <div className="mt-4">
                        <div className="w-full bg-gray-600 rounded-xl px-4 py-3">
                            <div className="flex sm:flex-row flex-col items-center gap-2 justify-between ">
                                <div className="flex  items-center gap-2">
                                    <img className="h-5 w-5 opacity-70" src="https://app.liquidium.fi/static/media/info_icon_filled.40bd59399be1040c76b1a3b23997eee0.svg" alt="info icon" />
                                    <p className="sm:text-sm text-xs text-gray-50 font-semibold">If the borrower fails to repay, the loan defaults.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                <div className="w-full grid md:grid-cols-2 grid-rows-1 gap-2.5">
                                    <FormField
                                        control={form.control}
                                        name="offer_amount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Enter Offer Amount
                                                </FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder={0.00} {...field} />
                                                </FormControl>
                                                <FormDescription>
                                                    <div className="flex flex-row justify-between">
                                                        <div className="flex flex-row">Best:
                                                            <img src="https://app.liquidium.fi/static/media/btcSymbol.371279d96472ac8a7b0392d000bf4868.svg" className="mx-2" /> 0.1752</div>

                                                        <div>$7913.67 USD</div>

                                                    </div>
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="interest_amount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Total Interest Amount</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder={0.00} {...field} />
                                                </FormControl>
                                                <FormDescription>
                                                    <div className="flex">   <img src="https://app.liquidium.fi/static/media/btcSymbol.371279d96472ac8a7b0392d000bf4868.svg" className="mr-2" />  $180.36 USD</div>
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                {/* <div className="flex flex-row justify-between space-x-2"> */}
                                    {/* <Button variant="outline" className={"w-full "}>Cancel</Button> */}


                                    {
                                        !ordinalsAddress ? (

                                            <Connect
                                                onConnect={onConnect}
                                            />

                                        ) : (<Button type="submit" variant="default" className={"w-full"}>OFFER</Button>)
                                    }
                                {/* </div> */}
                            </form>
                        </Form>
                    </div>
                </CardContent>
            </Card>
        </div>
    )

}