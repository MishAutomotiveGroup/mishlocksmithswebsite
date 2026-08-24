import type { Metadata } from "next";
import { chatGPTSignOutPath, requireChatGPTUser } from "@/app/chatgpt-auth";
import KeyDatabaseAdmin from "@/components/key-database/KeyDatabaseAdmin";
import { isKeyDatabaseAdmin } from "@/lib/key-database-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Key Database | Mish Auto Locksmiths",
  robots: { index: false, follow: false },
};

export default async function KeyDatabasePage() {
  const user = await requireChatGPTUser("/key-database");

  if (!isKeyDatabaseAdmin(user)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F4F6F8] p-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <img src="/logo-on-light.svg" alt="Mish Auto Locksmiths" className="mx-auto h-9 w-auto" />
          <h1 className="mt-8 text-2xl font-bold text-[#171C22]">Access denied</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            This key database is private and your signed-in account is not authorised.
          </p>
          <a
            href={chatGPTSignOutPath("/key-database")}
            className="mt-6 inline-flex rounded-lg bg-[#1677FF] px-5 py-3 text-sm font-semibold text-white"
          >
            Sign in with another account
          </a>
        </div>
      </main>
    );
  }

  return (
    <KeyDatabaseAdmin
      adminName={user.fullName ?? user.email}
      signOutPath={chatGPTSignOutPath("/")}
    />
  );
}

