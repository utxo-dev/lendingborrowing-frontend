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

    useEffect(() => {

        let active_loans = Object.values(state.active_loans)
            .filter((val) => {

                return val.borrower_ordinals_address == walletAddress.ordinalsAddress | val.lender_payments_address == walletAddress.paymentsAddress
            })
        setActiveLoans(active_loans)

    }, [])

    return (
        <section className="relative   mx-auto px-4 focus:outline-none sm:px-3 md:px-5">
            <div className="px-4 my-4">
                <p className="mt-4 text-3xl sm:text-4xl text-slate-900 font-extrabold tracking-tight dark:text-slate-50 ">
                    Loan Repayment Dashboard
                </p>

            </div>
            {
                isEmpty(activeLoans) ? <EmptyState /> : <div className="grid gap-y-16  sm:grid-cols-2 md:grid-cols-3">
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
    )

}

export default PortfolioComponent