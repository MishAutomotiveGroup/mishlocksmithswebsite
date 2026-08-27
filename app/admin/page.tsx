import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminHub from "@/components/key-database/AdminHub";
import { getAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Hub | Mish Auto Locksmiths",
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminPage() {
  const user = await getAdminSession();
  if (!user) redirect("/admin-login");
  return <AdminHub adminName={user.displayName} />;
}
