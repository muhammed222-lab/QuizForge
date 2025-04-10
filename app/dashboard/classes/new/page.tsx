import { redirect } from "next/navigation";
import { createClient } from "../../../../lib/supabase/server";
import { ClassForm } from "@/components/classes/class-form";

export default async function NewClassPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return redirect("/auth/login");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Create New Class</h1>
      </div>

      <ClassForm />
    </div>
  );
}
