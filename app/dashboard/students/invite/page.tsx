import { redirect } from "next/navigation";
import { createClient } from "../../../../lib/supabase/server";
import { InviteForm } from "@/components/students/invite-form";

export default async function InviteStudentsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return redirect("/auth/login");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Invite Students</h1>
      </div>

      <InviteForm userId={user.id} />
    </div>
  );
}
