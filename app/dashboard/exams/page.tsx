import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { DataTable } from "@/components/exams/data-table";
import { columns } from "@/components/exams/columns";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function ExamsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return redirect("/auth/login");

  const { data: exams } = await supabase
    .from("exams")
    .select(`*, classes(name)`)
    .eq("creator_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Exams</h1>
        <Button asChild>
          <Link href="/dashboard/exams/new" className="gap-2">
            <Plus className="h-4 w-4" />
            New Exam
          </Link>
        </Button>
      </div>

      <DataTable columns={columns} data={exams || []} />
    </div>
  );
}
