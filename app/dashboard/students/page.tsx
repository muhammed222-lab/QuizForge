import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { DataTable } from "@/components/students/data-table";
import { columns } from "@/components/students/columns";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function StudentsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return redirect("/auth/login");

  const { data: students } = await supabase
    .from("enrollments")
    .select(`*, students:users(name, email), classes(name)`)
    .eq("class_id", user.id); // Adjust based on your schema

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Students</h1>
        <Button asChild>
          <Link href="/dashboard/students/invite" className="gap-2">
            <Plus className="h-4 w-4" />
            Invite Students
          </Link>
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={
          students?.map((s) => ({
            ...s.students,
            class_name: s.classes?.name,
            enrollment_date: s.enrolled_at,
          })) || []
        }
      />
    </div>
  );
}
