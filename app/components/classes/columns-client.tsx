// components/classes/columns-client.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import type { Class } from "./columns-types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "./delete-button";

export const columns: ColumnDef<Class>[] = [
  {
    accessorKey: "name",
    header: "Class Name",
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => row.getValue("description") || "—",
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) =>
      new Date(row.getValue("created_at")).toLocaleDateString(),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const classItem = row.original;

      return (
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/classes/${classItem.id}/edit`}>
            <Button variant="outline" size="sm">
              Edit
            </Button>
          </Link>
          <DeleteButton id={classItem.id} />
        </div>
      );
    },
  },
];
