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
import { Book } from "lucide-react";

export default function RecentClasses({
  classes,
}: {
  classes: Array<{ id: string; name: string; created_at: string }>;
}) {
  return (
    <div className="rounded-lg border">
      <div className="flex items-center justify-between p-4">
        <h2 className="text-lg font-semibold">Recent Classes</h2>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/classes">View All</Link>
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Class Name</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {classes.map((classItem) => (
            <TableRow key={classItem.id}>
              <TableCell className="font-medium">{classItem.name}</TableCell>
              <TableCell>
                {new Date(classItem.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/dashboard/classes/${classItem.id}`}>
                    <Book className="h-4 w-4 mr-2" />
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
