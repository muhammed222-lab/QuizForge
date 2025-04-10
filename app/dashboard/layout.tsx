import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import DashboardSidebar from "@/components/dashboard/sidebar";
import DashboardHeader from "@/components/dashboard/header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/auth/login");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1 overflow-hidden">
        <DashboardHeader user={user} />
        <main className="p-6 overflow-auto h-[calc(100vh-64px)]">
          {children}
        </main>
      </div>
    </div>
  );
}
