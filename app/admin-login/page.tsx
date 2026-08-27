import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminLoginForm from "@/components/key-database/AdminLoginForm";
import { getAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Login | Mish Auto Locksmiths",
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminLoginPage() {
  if (await getAdminSession()) redirect("/admin");
  return <AdminLoginForm />;
}

