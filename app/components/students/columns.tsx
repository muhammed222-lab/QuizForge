"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Mail, Book } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export type Student = {
  id: string;
  name: string;
  email: string;
  class_name?: string;
  enrollment_date?: string;
};

export const columns: ColumnDef<Student>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <Link
        href={`/dashboard/students/${row.original.id}`}
        className="font-medium hover:underline"
      >
        {row.getValue("name")}
      </Link>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="flex items-center gap-2">
        <Mail className="h-4 w-4 text-muted-foreground" />
        {row.getValue("email")}
      </span>
    ),
  },
  {
    accessorKey: "class_name",
    header: "Class",
    cell: ({ row }) => (
      <span className="flex items-center gap-2 text-muted-foreground">
        <Book className="h-4 w-4" />
        {row.getValue("class_name") || "No class"}
      </span>
    ),
  },
  {
    accessorKey: "enrollment_date",
    header: "Enrolled",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.getValue("enrollment_date")
          ? new Date(row.getValue("enrollment_date")).toLocaleDateString()
          : "-"}
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
              <Link href={`/dashboard/students/${row.original.id}`}>View</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`mailto:${row.original.email}`}>Send Email</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
