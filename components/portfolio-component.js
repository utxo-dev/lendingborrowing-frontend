'use client'

import { Suspense } from 'react'
import LoanStatusCard from '@/components/loan-status-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import { useWalletAddress } from '@/hooks/use-wallet-address';
import EmptyState from "@/components/empty-state"
import { isEmpty } from '@/lib/utils';

const PortfolioComponent = ({ state }) => {
    const walletAddress = useWalletAddress();
    const [activeLoans, setActiveLoans] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(true)
        let active_loans = Object.values(state.active_loans)
            .filter((val) => {

                return val.borrower_ordinals_address == walletAddress.ordinalsAddress | val.lender_payments_address == walletAddress.paymentsAddress
            })
        setActiveLoans(active_loans)
        setIsLoading(false)

        return () => {
            setIsLoading(true)

        }


    }, [state])

    return (
        <div className="relative    px-4 focus:outline-none sm:px-3 md:px-5">
            <div className="px-4 my-4">
                <p className="mt-4 text-3xl  text-slate-900 font-semibold tracking-tight dark:text-slate-50 ">
                    Loan Repayment Dashboard
                </p>

            </div>
        
            <Suspense fallback={<p className='bg-yellow'>Loading feed...</p>}>
            {   isEmpty(activeLoans) ? <EmptyState /> : <div className="grid gap-y-16  sm:grid-cols-2 md:grid-cols-3">
                    {
                        activeLoans.map((active_loan) => {
                            return (
                                <LoanStatusCard key={active_loan.loan_id} loan={active_loan} />
                            )
                        })
                    }

                </div> }  
                </Suspense>
         


        </div>
    )

}

export default PortfolioComponent