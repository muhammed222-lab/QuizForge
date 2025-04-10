// components/classes/delete-button.tsx
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { createClient } from "../../../lib/supabase/client";

interface DeleteButtonProps {
  id: string;
}

export function DeleteButton({ id }: DeleteButtonProps) {
  const router = useRouter();

  const handleDelete = async () => {
    const confirmed = confirm("Are you sure you want to delete this class?");
    if (!confirmed) return;

    const supabase = createClient();
    const { error } = await supabase.from("classes").delete().eq("id", id);

    if (!error) {
      router.refresh(); // Refresh the page data
    } else {
      alert("Failed to delete class.");
      console.error(error);
    }
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      className="flex items-center gap-1"
    >
      <Trash className="w-4 h-4" />
      Delete
    </Button>
  );
}
