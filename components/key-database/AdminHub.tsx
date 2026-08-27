import Link from "next/link";
import { ChevronRight, ClipboardList, KeyRound } from "lucide-react";
import AdminHeader from "@/components/key-database/AdminHeader";

export default function AdminHub({ adminName }: { adminName: string }) {
  return (
    <main className="min-h-screen bg-[#F4F6F8] text-[#171C22]">
      <AdminHeader adminName={adminName} sectionTitle="Admin hub" />

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#1677FF]">Internal tools</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Admin hub</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Choose the area you want to manage. Each tool has its own page and can be refreshed independently.
        </p>

        <div className="mt-9 grid gap-5 md:grid-cols-2">
          <Link href="/key-database" className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md sm:p-7">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#1677FF]">
              <KeyRound className="h-6 w-6" />
            </div>
            <div className="mt-6 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold">Key database</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">Find vehicles, review possible keys and add or edit complete key records.</p>
              </div>
              <ChevronRight className="h-6 w-6 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#1677FF]" />
            </div>
          </Link>

          <Link href="/quote-log" className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md sm:p-7">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#1677FF]">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div className="mt-6 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold">Quote log</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">Review customer quote searches, references, vehicles and match results.</p>
              </div>
              <ChevronRight className="h-6 w-6 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#1677FF]" />
            </div>
          </Link>
        </div>
      </section>
    </main>
  );
}
