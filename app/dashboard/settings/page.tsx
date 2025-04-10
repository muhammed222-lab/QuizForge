import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { ProfileForm } from "@/components/settings/profile-form";
import { AccountForm } from "@/components/settings/account-form";
import { AppearanceForm } from "@/components/settings/appearance-form";

export default async function SettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="space-y-8">
        <ProfileForm user={user} profile={profile} />
        <AccountForm />
        <AppearanceForm />
      </div>
    </div>
  );
}
