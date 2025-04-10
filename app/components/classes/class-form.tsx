/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, ControllerRenderProps } from "react-hook-form";
import * as z from "zod";
import { toast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

const classFormSchema = z.object({
  name: z.string().min(2, {
    message: "Class name must be at least 2 characters.",
  }),
  description: z.string().optional(),
});

export function ClassForm({
  defaultValues,
}: {
  defaultValues?: z.infer<typeof classFormSchema>;
}) {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const form = useForm<z.infer<typeof classFormSchema>>({
    resolver: zodResolver(classFormSchema),
    defaultValues: defaultValues || {
      name: "",
      description: "",
    },
  });

  async function onSubmit(values: z.infer<typeof classFormSchema>) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase.from("classes").insert({
        name: values.name,
        description: values.description,
        tutor_id: user.id,
      });

      if (error) throw error;

      toast({
        title: "Class created",
        description: "Your new class has been successfully created.",
      });
      router.push("/dashboard/classes");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  return (
    <Form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <FormField
        control={form.control}
        name="name"
        render={({
          field,
        }: {
          field: ControllerRenderProps<z.infer<typeof classFormSchema>, "name">;
        }) => (
          <FormItem>
            <FormLabel>Class Name</FormLabel>
            <FormControl>
              <Input placeholder="Advanced Mathematics" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({
          field,
        }: {
          field: ControllerRenderProps<
            z.infer<typeof classFormSchema>,
            "description"
          >;
        }) => (
          <FormItem>
            <FormLabel>Description (Optional)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe what this class is about..."
                className="resize-none"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/classes")}
        >
          Cancel
        </Button>
        <Button type="submit">Create Class</Button>
      </div>
    </Form>
  );
}
