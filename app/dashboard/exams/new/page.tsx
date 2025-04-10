import { redirect } from "next/navigation";
import { createClient } from "../../../../lib/supabase/server";
import { ExamForm } from "@/components/exams/exam-form";

export default async function NewExamPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return redirect("/auth/login");

  // Fetch classes for dropdown
  const { data: classes } = await supabase
    .from("classes")
    .select("id, name")
    .eq("tutor_id", user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Create New Exam</h1>
      </div>

      <ExamForm classes={classes || []} />
    </div>
  );
}
