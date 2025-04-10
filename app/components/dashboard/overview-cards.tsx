import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, FileText, Users } from "lucide-react";
import { createClient } from "../../../lib/supabase/server";

export default async function OverviewCards({ userId }: { userId: string }) {
  const supabase = createClient();

  const [classesCount, examsCount, studentsCount] = await Promise.all([
    supabase
      .from("classes")
      .select("*", { count: "exact", head: true })
      .eq("tutor_id", userId),
    supabase
      .from("exams")
      .select("*", { count: "exact", head: true })
      .eq("creator_id", userId),
    supabase
      .from("enrollments")
      .select("*", { count: "exact", head: true })
      .eq("class_id", userId), // This needs adjustment based on your schema
  ]);

  const stats = [
    {
      title: "Total Classes",
      value: classesCount.count || 0,
      icon: Book,
      color: "text-blue-500",
    },
    {
      title: "Active Exams",
      value: examsCount.count || 0,
      icon: FileText,
      color: "text-green-500",
    },
    {
      title: "Students",
      value: studentsCount.count || 0,
      icon: Users,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
