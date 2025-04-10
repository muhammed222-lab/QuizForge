/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { User } from "@supabase/supabase-js";
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
import { Button } from "@/components/ui/button";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const profileFormSchema = z.object({
  full_name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  avatar_url: z.string().url().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function ProfileForm({ user, profile }: { user: User; profile: any }) {
  const supabase = createClientComponentClient();
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      full_name: profile?.full_name || "",
      avatar_url: profile?.avatar_url || "",
    },
  });

  async function onSubmit(data: ProfileFormValues) {
    try {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: data.full_name,
        avatar_url: data.avatar_url,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="full_name"
            render={({
              field,
            }: {
              field: import("react-hook-form").ControllerRenderProps;
            }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="avatar_url"
            render={({
              field,
            }: {
              field: import("react-hook-form").ControllerRenderProps;
            }) => (
              <FormItem>
                <FormLabel>Avatar URL</FormLabel>
                <FormControl>
                  <Input placeholder="/favicon.png" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit">Update profile</Button>
      </form>
    </Form>
  );
}
