import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { Calendar } from "@/components/schedule/calendar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function SchedulePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return redirect("/auth/login");

  const { data: exams } = await supabase
    .from("exams")
    .select(`id, title, start_time, end_time, classes(name)`)
    .eq("creator_id", user.id)
    .order("start_time", { ascending: true });

  const events =
    exams?.map((exam) => ({
      id: exam.id,
      title: exam.title,
      start: new Date(exam.start_time),
      end: new Date(exam.end_time),
      className: exam.classes?.[0]?.name,
    })) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Exam Schedule</h1>
        <Button asChild>
          <Link href="/dashboard/exams/new" className="gap-2">
            <Plus className="h-4 w-4" />
            New Exam
          </Link>
        </Button>
      </div>

      <Calendar events={events} />
    </div>
  );
}
