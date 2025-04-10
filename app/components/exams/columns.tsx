"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export type Exam = {
  id: string;
  title: string;
  class_id: string;
  classes: { name: string };
  duration_minutes: number;
  start_time: string;
  end_time: string;
  is_published: boolean;
};

export const columns: ColumnDef<Exam>[] = [
  {
    accessorKey: "title",
    header: "Exam Title",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Link
          href={`/dashboard/exams/${row.original.id}`}
          className="font-medium hover:underline"
        >
          {row.getValue("title")}
        </Link>
        {row.original.is_published && (
          <Badge variant="secondary">Published</Badge>
        )}
      </div>
    ),
  },
  {
    accessorKey: "classes.name",
    header: "Class",
    cell: ({ row }) => (
      <Link
        href={`/dashboard/classes/${row.original.class_id}`}
        className="text-muted-foreground hover:underline"
      >
        {row.original.classes?.name}
      </Link>
    ),
  },
  {
    accessorKey: "start_time",
    header: "Date",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {new Date(row.getValue("start_time")).toLocaleDateString()}
      </span>
    ),
  },
  {
    accessorKey: "duration_minutes",
    header: "Duration",
    cell: ({ row }) => (
      <span className="flex items-center gap-1 text-muted-foreground">
        <Clock className="h-4 w-4" />
        {row.getValue("duration_minutes")} mins
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/exams/${row.original.id}`}>View</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/exams/${row.original.id}/edit`}>
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/exams/${row.original.id}/results`}>
                <Users className="h-4 w-4 mr-2" />
                View Results
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
