
import LoanStatusCard from '@/components/loan-status-card';
import { Skeleton } from '@/components/ui/skeleton';


export const metadata = {
  title: "Portfolio Page",
}

export default async function PortfolioPage() {
 
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
       
        <div className="grid gap-y-16  sm:grid-cols-2 md:grid-cols-3">
          <LoanStatusCard />
          <LoanStatusCard />
          <LoanStatusCard />
          <LoanStatusCard />

          <LoanStatusCard />

        </div>
      </section>
    </div>
  )
}