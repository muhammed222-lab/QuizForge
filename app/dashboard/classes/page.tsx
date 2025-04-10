// app/dashboard/classes/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { ClassTableWrapper } from "@/components/classes/class-table-wrapper";

export default async function ClassesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return redirect("/auth/login");

  const { data: classes, error } = await supabase
    .from("classes")
    .select("*")
    .eq("tutor_id", user.id)
    .order("created_at", { ascending: false });

  console.log("✅ classes:", classes);
  console.log("✅ error:", error);

  if (error) {
    return <div className="text-red-500">Error loading table.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Classes</h1>
        <Button asChild>
          <Link href="/dashboard/classes/new" className="gap-2">
            <Plus className="h-4 w-4" />
            New Class
          </Link>
        </Button>
      </div>

      <ClassTableWrapper data={classes || []} />
    </div>
  );
}
