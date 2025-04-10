/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

const inviteFormSchema = z.object({
  emails: z.string().refine(
    (value) => {
      const emails = value.split(/[\n,]/).map((e) => e.trim());
      return emails.every((e) => z.string().email().safeParse(e).success);
    },
    {
      message:
        "Please enter valid email addresses separated by commas or new lines",
    }
  ),
  message: z.string().optional(),
});

export function InviteForm({ userId }: { userId: string }) {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const form = useForm<z.infer<typeof inviteFormSchema>>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      emails: "",
      message: "",
    },
  });

  async function onSubmit(values: z.infer<typeof inviteFormSchema>) {
    try {
      const emails = values.emails.split(/[\n,]/).map((e) => e.trim());

      const { error } = await supabase.from("invitations").insert(
        emails.map((email) => ({
          email,
          inviter_id: userId,
          message: values.message,
        }))
      );

      if (error) throw error;

      toast({
        title: "Invitations sent",
        description: `${emails.length} students have been invited.`,
      });
      router.push("/dashboard/students");
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
        <FormField
          control={form.control}
          name="emails"
          render={({
            field,
          }: {
            field: {
              value: string;
              onChange: (value: string) => void;
              onBlur: () => void;
              name: string;
            };
          }) => (
            <FormItem>
              <FormLabel>Student Emails</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter email addresses separated by commas or new lines"
                  className="min-h-[120px]"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  onBlur={field.onBlur}
                  name={field.name}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({
            field,
          }: {
            field: {
              value: string;
              onChange: (value: string) => void;
              onBlur: () => void;
              name: string;
            };
          }) => (
            <FormItem>
              <FormLabel>Custom Message (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add a personal message..."
                  className="min-h-[100px]"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  onBlur={field.onBlur}
                  name={field.name}
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
            onClick={() => router.push("/dashboard/students")}
          >
            Cancel
          </Button>
          <Button type="submit">Send Invitations</Button>
        </div>
      </form>
    </Form>
  );
}
