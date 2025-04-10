import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

export default function UpcomingExams({
  exams,
}: {
  exams: Array<{ id: string; title: string; start_time: string }>;
}) {
  return (
    <div className="rounded-lg border">
      <div className="flex items-center justify-between p-4">
        <h2 className="text-lg font-semibold">Upcoming Exams</h2>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/exams">View All</Link>
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Exam Title</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {exams.map((exam) => (
            <TableRow key={exam.id}>
              <TableCell className="font-medium">{exam.title}</TableCell>
              <TableCell>
                {new Date(exam.start_time).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/dashboard/exams/${exam.id}`}>
                    <FileText className="h-4 w-4 mr-2" />
                    View
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
