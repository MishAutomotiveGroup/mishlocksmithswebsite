import type { Metadata } from "next";
import { redirect } from "next/navigation";
import QuoteSearchLog from "@/components/key-database/QuoteSearchLog";
import { getAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Quote Log | Mish Auto Locksmiths",
  robots: { index: false, follow: false, nocache: true },
};

export default async function QuoteLogPage() {
  const user = await getAdminSession();
  if (!user) redirect("/admin-login");
  return <QuoteSearchLog adminName={user.displayName} />;
}
