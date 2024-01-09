"use client"

import { useState, useEffect } from "react"
import { Image } from "next/image"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "@/components/ui/use-toast"

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


const FormSchema = z.object({
    check: z.boolean().default(false).optional(),
})

export default function BorrowComponent() {

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

    const form = useForm({
        defaultValues: {
            check: false,
        },
    })

    function onSubmit(data) {
        toast({
            title: "You submitted the following values:",
            description: (
                <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
                    <code className="text-white">{JSON.stringify(data, null, 2)}</code>
                </pre>
            ),
        })
        console.log("submit", data)
    }

    return (
        <div className="flex items-center justify-center h-screen">
            <Card className="sm:w-[85vw] w-[100vw] max-w-[660px]   rounded-2xl flex flex-col  border bg-card text-card-foreground shadow">




                <CardHeader>
                    <CardTitle>
                        <div className="flex gap-4 ">
                            <img src="https://firebasestorage.googleapis.com/v0/b/liquidium-dev.appspot.com/o/collections%2Fbitcoin-frogs.webp?alt=media&amp;token=e72eb645-0a9d-44ee-9727-d2c83552ffb6" alt="" className="w-[66px] h-[66px] rounded-xl" />
                            <div className="flex flex-col w-full justify-between &quot; py-1"><div className="flex items-center gap-1 justify-between w-full ">
                                <p className="sm:text-2xl text-xl font-extrabold leading-5">Bitcoin Frogs</p>
                                <a className="bg-[#f72c87] flex justify-center items-center p-[6px] rounded-md hover:opacity-80 cursor-pointer" target="_blank" rel="noreferrer" href="https://magiceden.io/ordinals/marketplace/bitcoin-frogs">
                                    <img className="h-3" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAAyCAYAAADLLVz8AAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAATNSURBVHgB7ZqPVSJJEMarelh1BDyJ4LgIzotgMQOMYDGCcyNYiOD2IliMQC8CvQjECJaLQA4GBmXouqqRuce6CkxP9zC8t7/3VPzDTPtNddXX1Y2wRDAMWwrhgwY6QcBjAOwBUk950PF9vw9b4vtxbQvseQhd8uivRA+UT0R0HAbTKwJovPVWBartV/c7kCObjGsrIPQ5qE5FxFjAySi82WSQeYs4Hk2ueLRNKCIs4tPs4Dcl02PTJ6xBt8PR4yfIgXF8n4KKJxDU90rTC5yMphx91EjzXteRGIZhXUfwFYoORyGORyGBAa5ElLw3GU/v5AnDDqDAEFfTmfPe510Rj0NwYCygYFvESTD9HVF9gB0B2eIZT+FlbExnyXvziO626/PSwdF3mikCE2xEop7DzS6Jx3T8qn9rRUAhi4ixZdmZvEcDQvpYrvpt+c7KFF4m7XQWH4oIX8ARfO0+EVyCBYjm/fK8fI01HPx/fdsCCpuKGPs9nrpOo2+xYqgt/dM2sTaFl5HpPA7CtVHFRePa+dTl6++XplfgCCcCxhC0VokoeY+Lxq+QA7JUnQSTP8AB7gQU3hAxHIUNjtM2pIbuJaeBAUR44cL4O8mB398FuuWKfy4vTfOeCIczOJXXukR3YGh5FHotv7JnpajE14M8WIrE+YwjzyDv6dn8zK/5ffnQgGdgiCb9OQieTsAS+UTgAu76DAzNcifxXQnBv9xKUmSW15YaopCRXAU0A6/L1YNXI240Cts8hczymiV7k34Ko+qaJvLUt5JIiejjW7+vclQSabN8Jg3Rd9PMlTm1gAT67+dkTj1wTJL3Vv3NbP50YTwWzs3PjsAcoyIi/9RT9OhaxE6lVll7/VqtNlARnpnOCp1xw8q4CsvA3Ykoee/borEKeaCLWZE+nxFlqsiZbIwLEdflvTc5ACNQ4U+Qgcw+0LaIc4LzdXnv1ffJutrAImmie8iAFSNtUcQOV9ZbSEmWdbXH6QIyYG0lklVERLxNk/cSxsPHptm6GmJL5hs8sGWsLuVMRXxe59I5pETW1aC0kZeLc+1MZ96Wtb4WNhFxE7/3Gub9RF5SctU2uedLnDQTUoq4kd97SaZ+InnnNsQTnHVjEhHX7Ed0TPKeeT9xcc+j/UyFY5kSOERE5C8tXvR3OVqaCiGOGE1wz52Za5OKu+gnfgGzFojRA1uFUwETFkLdggUoinfw6pCauKvTBsvk01C1hOQ9k8OWUnEPo/3UVX4TdkbA2LIY5L1kKwAdbWvmMoWzsjjydgMG8GbSQHtRIxgGkBUPvf5L470TAoZBvJtWByPoBNGzcvKBW1/Aezt90my9jvyu/KzwU1gsC1fsCygKbNzlKEqyRVp4AbXDczNZeD5MFTYKLeBwOG4W+dQWO4JPqQXUWjupZq/BgyvuKX2GEOqpBXyHKj8B0fsZCo6CFJsx4qmy9s/SwPblHygwCNwS0ykOH9o6qLgpXEC6UGC0hkt8eHg43ivtf123nxAvhyr+L5AzwXDcLebJfbovVw9PlHRMCPXpqn1VabcnJ6PypnJUbmmgP6FAiB6Hkd+IXyc/DB/C+tyDtlLwnhbWQf5Qa7pMXPc2icenqKlK6j37h2M213XIFRwoxF6k9WU1xzrwgx+s5j+VtIUzuxUSMAAAAABJRU5ErkJggg==" alt="" /></a>
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
                                        <Image src="https://app.liquidium.fi/static/media/btcSymbol.371279d96472ac8a7b0392d000bf4868.svg" alt="BTC Symbol" className="mr-1 h-5 sm:h-6" />
                                        <p className="text-black">0.264</p>
                                        <p className=" "></p>
                                    </div>
                                </div>
                                <div className="p-3 rounded-xl border border-white/20">
                                    <p className=" font-medium sm:text-sm text-xs">Duration</p>
                                    <div className="flex font-bold text-sm sm:text-base mt-1">
                                        <p className="text-white">16</p><p className=" ml-1">Days</p>
                                    </div></div><div className="p-3 rounded-xl border border-white/20">
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

                    <p className="text-2xl font-bold  mt-8">Collateral</p>

                    {/* <div className="mt-4">
                        <div className="w-full bg-gray-600 rounded-xl px-4 py-3">
                            <div className="flex sm:flex-row flex-col items-center gap-2 justify-between ">
                                <div className="flex  items-center gap-2">
                                    <img className="h-5 w-5 opacity-70" src="https://app.liquidium.fi/static/media/info_icon_filled.40bd59399be1040c76b1a3b23997eee0.svg" alt="info icon" />
                                    <p className="sm:text-sm text-xs text-gray-50 font-semibold">If the borrower fails to repay, the loan defaults.</p>
                                </div>
                            </div>
                        </div>
                    </div> */}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-8 my-8">
                                <div className="flex items-center">
                                    <Avatar className="flex h-9 w-9 items-center justify-center space-y-0 border">
                                        <AvatarImage src="https://ord-mirror.magiceden.dev/content/b54fae7448c2efe2b2adf90d0b753180794ce2b29692cc2278b73440fdb86a8ci0" alt="Avatar" />
                                        <AvatarFallback>BF</AvatarFallback>
                                    </Avatar>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">Bitcoin Frog
                                        </p>
                                        <p className="text-sm text-muted-foreground">#2670</p>
                                    </div>
                                    <div className="ml-auto font-medium">
                                        <FormField
                                            control={form.control}
                                            name="check"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md  p-4 ">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value}
                                                            // onCheckedChange={field.onChange}
                                                            onCheckedChange={() => field.onChange(!field.value)}
                                                        />
                                                    </FormControl>

                                                </FormItem>
                                            )}
                                        />

                                    </div>
                                </div>
                            </div>
                            
                            <Button type="submit" variant="default" className={"w-full"}>Borrow </Button>
                            
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )

}