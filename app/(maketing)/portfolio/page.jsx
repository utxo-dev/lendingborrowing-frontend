"use client"

import LoanStatusCard from '@/components/loan-status-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import { useWalletAddress } from '@/hooks/use-wallet-address';
import EmptyState from "@/components/empty-state"
import { isEmpty } from '@/lib/utils';

/*
export const metadata = {
  title: "Portfolio Page",
}
*/

export default function PortfolioPage() {

  const walletAddress = useWalletAddress();
  const [ activeLoans, setActiveLoans ] = useState([]);

  const getState = async () => {
    
    const response = await fetch("https://oracle.utxo.dev", {
      method: "POST",
      headers: {
          'Content-Type': 'application/json', 
          Accept: 'application/json'
      },
      body: JSON.stringify({
          "jsonrpc": "2.0",
          "id": "id",
          "method": "read_contract_state",
          "params": {
            "contract_id": "liquidium",
          }
      }),
    });

    const result = await response.json();

    const state = JSON.parse(result.result);

    return state

  }

  useEffect(() => {
    getState().then((state) => {
      let active_loans = Object.values(state.active_loans)
        .filter((val) => {
          console.log(val , walletAddress)
          return val.borrower_ordinals_address == walletAddress.ordinalsAddress | val.lender_payments_address == walletAddress.paymentsAddress
        })
      setActiveLoans(active_loans)
    })
  }, [])
 
  return (
    <div className="flex w-full flex-col gap-16 py-8 md:py-8">
 

      <section className="relative   mx-auto px-4 focus:outline-none sm:px-3 md:px-5">
        <div className="px-4 my-4">
            <p className="mt-4 text-3xl sm:text-4xl text-slate-900 font-extrabold tracking-tight dark:text-slate-50 ">
          Loan Repayment Dashboard
        </p>
        <p className="mt-4 max-w-3xl space-y-6 ">
          {/* Utility classes help you work within the constraints of a system
          instead of littering your stylesheets with arbitrary values. They make
          it easy to be consistent with color choices, spacing, typography,
          shadows, and everything else that makes up a well-engineered design
          system. */}
        </p>
        </div>
        {
          isEmpty(activeLoans)  ?<EmptyState/>  : <div className="grid gap-y-16  sm:grid-cols-2 md:grid-cols-3">
          {
            activeLoans.map((active_loan) => {
              return (
                <LoanStatusCard key={active_loan.loan_id} loan={active_loan} />
              )
            })
          }

        </div>
        }
       
        
      </section>
    </div>
  )
}