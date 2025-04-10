import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import OverviewCards from "@/components/dashboard/overview-cards";
import RecentClasses from "@/components/dashboard/recent-classes";
import UpcomingExams from "@/components/dashboard/upcoming-exams";
import QuickActions from "@/components/dashboard/quick-actions";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/auth/login");
  }

  // Fetch data in parallel
  const [classesData, examsData] = await Promise.all([
    supabase
      .from("classes")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("exams")
      .select("*")
      .order("start_time", { ascending: true })
      .limit(3),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <QuickActions />
      </div>

      <OverviewCards userId={user.id} />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <RecentClasses classes={classesData.data || []} />
        <UpcomingExams exams={examsData.data || []} />
      </div>
    </div>
  );
}
