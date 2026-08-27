import type { Metadata } from "next";
import { redirect } from "next/navigation";
import KeyDatabaseAdmin from "@/components/key-database/KeyDatabaseAdmin";
import { getAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Key Database | Mish Auto Locksmiths",
  robots: { index: false, follow: false },
};

export default async function KeyDatabasePage({
  searchParams,
}: {
  searchParams: Promise<{ vehicle?: string }>;
}) {
  const user = await getAdminSession();
  if (!user) redirect("/admin-login");
  const { vehicle = "" } = await searchParams;
  return <KeyDatabaseAdmin adminName={user.displayName} initialVehicleId={vehicle} />;
}
