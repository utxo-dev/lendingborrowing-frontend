import BorrowCard from "@/components/borrow-card";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Borrow Page",
};

export default async function BorrowPage() {
  return (
    <section className="container">
      <div className="flex w-full flex-col gap-16 py-8 md:py-8">
        <div className="relative    px-4 focus:outline-none sm:px-3 md:px-5">
          <div className="px-4 my-4">
            <p className="mt-4 text-3xl  text-slate-900 font-semibold tracking-tight dark:text-slate-50 ">
              Borrow
            </p>
            <p className="mt-4 max-w-3xl space-y-6 "></p>
          </div>

          <div className="grid gap-y-16 sm:grid-cols-2  md:grid-cols-3">
            <BorrowCard />
          </div>
        </div>
      </div>
    </section>
  );
}
