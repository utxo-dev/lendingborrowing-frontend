"use client";

import { useState, useEffect } from "react";

import useScroll from "@/hooks/use-scroll";

import { MainNav } from "./main-nav";
import { UserAccountNav } from "./user-account-nav";

import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useWalletModal } from "@/hooks/use-wallet-model";

export function NavBar({
  user,
  items,
  children,
  rightElements,
  scroll = false,
}) {
  const scrolled = useScroll(50);
  const signInModal = useWalletModal();

  let [paymentsAddress, setPaymentsAddress] = useState();
  let [paymentsPublicKey, setPaymentsPublicKey] = useState();
  let [ordinalsAddress, setOrdinalsAddress] = useState();
  let [ordinalsPublicKey, setOrdinalsPublicKey] = useState();

  useEffect(() => {
    setPaymentsAddress(localStorage.getItem("paymentsAddress"));
    setPaymentsPublicKey(localStorage.getItem("paymentsPublicKey"));
    setOrdinalsAddress(localStorage.getItem("ordinalsAddress"));
    setOrdinalsPublicKey(localStorage.getItem("ordinalsPublicKey"));
  });

  const disconnectWallet = () => {
    localStorage.removeItem("paymentsAddress");
    localStorage.removeItem("paymentsPublicKey");
    localStorage.removeItem("ordinalsAddress");
    localStorage.removeItem("ordinalsPublicKey");
    setPaymentsAddress(null);
    setPaymentsPublicKey(null);
    setOrdinalsAddress(null);
    setOrdinalsPublicKey(null);
  };

  return (
    <header
      className={`container sticky top-0 z-40 flex w-full justify-center bg-background/60 backdrop-blur-xl transition-all ${
        scroll ? (scrolled ? "border-b" : "bg-background/0") : "border-b"
      }`}
    >
      <div className="container flex h-16 items-center justify-between py-4">
        <MainNav items={items}>{children}</MainNav>

        <div className="flex items-center space-x-3">
          {rightElements}

          {/* {!user ? (
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" })
                )}
              >
                Login Page
              </Link>
            ) : null} */}

          { ordinalsAddress&& ordinalsAddress ? (
            <UserAccountNav user={user} disconnectWallet={disconnectWallet} />
          ) : (
            <Button
              className="px-3"
              variant="default"
              size="lg"
              onClick={signInModal.onOpen}
            >
              Connect
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
