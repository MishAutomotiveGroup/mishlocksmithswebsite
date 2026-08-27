"use client";

import Link from "next/link";
import { LayoutDashboard, LogOut } from "lucide-react";

export default function AdminHeader({ adminName, sectionTitle }: { adminName: string; sectionTitle: string }) {
  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.assign("/admin-login");
  }

  return (
    <header className="border-b border-slate-800 bg-[#171C22] text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <Link href="/" aria-label="Return to website" className="shrink-0">
            <img src="/logo-on-dark.svg" alt="Mish Auto Locksmiths" className="h-8 w-auto sm:h-9" />
          </Link>
          <div className="hidden h-8 w-px bg-slate-700 sm:block" />
          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-sm font-semibold">{sectionTitle}</p>
            <p className="truncate text-xs text-slate-400">Private admin</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden max-w-48 truncate text-xs text-slate-400 lg:block">{adminName}</span>
          <Link
            href="/admin"
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-700 px-3 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:text-white"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Admin hub</span>
          </Link>
          <button
            type="button"
            onClick={() => void signOut()}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-700 px-3 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
