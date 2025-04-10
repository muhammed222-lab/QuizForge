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
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "../../../lib/utils";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const examFormSchema = z
  .object({
    title: z.string().min(2, {
      message: "Exam title must be at least 2 characters.",
    }),
    class_id: z.string().min(1, {
      message: "Please select a class",
    }),
    description: z.string().optional(),
    duration_minutes: z.number().min(1).max(300),
    start_time: z.date(),
    end_time: z.date(),
    is_published: z.boolean().default(false),
    shuffle_questions: z.boolean().default(false),
    max_attempts: z.number().min(1).default(1),
  })
  .refine((data) => data.end_time > data.start_time, {
    message: "End time must be after start time",
    path: ["end_time"],
  });

export function ExamForm({
  classes,
  defaultValues,
}: {
  classes: Array<{ id: string; name: string }>;
  defaultValues?: Partial<z.infer<typeof examFormSchema>>;
}) {
  const [isMounted, setIsMounted] = useState(false);
  const supabase = createClientComponentClient();
  const router = useRouter();

  const form = useForm<z.infer<typeof examFormSchema>>({
    resolver: zodResolver(examFormSchema),
    defaultValues: {
      title: "",
      class_id: "",
      description: "",
      duration_minutes: 60,
      start_time: new Date(),
      end_time: new Date(Date.now() + 60 * 60 * 1000), // 1 hour later
      is_published: false,
      shuffle_questions: false,
      max_attempts: 1,
      ...defaultValues,
    },
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  async function onSubmit(values: z.infer<typeof examFormSchema>) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase.from("exams").insert({
        title: values.title,
        description: values.description,
        class_id: values.class_id,
        duration_minutes: values.duration_minutes,
        start_time: values.start_time.toISOString(),
        end_time: values.end_time.toISOString(),
        is_published: values.is_published,
        shuffle_questions: values.shuffle_questions,
        max_attempts: values.max_attempts,
        creator_id: user.id,
      });

      if (error) throw error;

      toast({
        title: "Exam created",
        description: "Your new exam has been successfully created.",
      });
      router.push("/dashboard/exams");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  if (!isMounted) {
    return null; // or a loading spinner
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Exam Title</FormLabel>
                <FormControl>
                  <Input placeholder="Midterm Exam" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="class_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Class</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {classes.map((classItem) => (
                      <SelectItem key={classItem.id} value={classItem.id}>
                        {classItem.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe what this exam covers..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="start_time"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Time</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_time"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Time</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date() ||
                        date <= form.getValues("start_time")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration_minutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (minutes)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={300}
                    value={field.value}
                    onChange={(e) =>
                      field.onChange(Number(e.target.value) || 0)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="max_attempts"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Attempts</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    value={field.value}
                    onChange={(e) =>
                      field.onChange(Number(e.target.value) || 1)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_published"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-4">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </FormControl>
                <FormLabel>Publish immediately</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="shuffle_questions"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-4">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </FormControl>
                <FormLabel>Shuffle questions</FormLabel>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/exams")}
          >
            Cancel
          </Button>
          <Button type="submit">Create Exam</Button>
        </div>
      </form>
    </Form>
  );
}
