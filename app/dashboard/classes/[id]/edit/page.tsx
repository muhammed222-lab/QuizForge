import { ClassForm } from "@/components/classes/class-form";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";

export default async function EditClassPage({
  params,
}: {
  params: { id: string };
}) {
  // Create authenticated Supabase client for server components
  const supabase = createServerComponentClient({ cookies });

  try {
    // Get current user session
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("❌ Auth error", userError);
      return redirect("/auth/login");
    }

    // Fetch class data
    const { data: classData, error: classError } = await supabase
      .from("classes")
      .select("*")
      .eq("id", params.id)
      .eq("tutor_id", user.id)
      .single();

    if (classError || !classData) {
      console.error("❌ Class fetch error", classError);
      return notFound();
    }

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Edit Class</h1>
        <ClassForm
          defaultValues={{
            name: classData.name,
            description: classData.description,
          }}
        />
      </div>
    );
  } catch (error) {
    console.error("❌ Unexpected error", error);
    return redirect("/auth/login");
  }
}
