// components/classes/columns-types.ts
import { ColumnDef } from "@tanstack/react-table";

export type Class = {
  id: string;
  name: string;
  description?: string;
  created_at: string;
};

export const baseColumns: ColumnDef<Class>[] = [
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
];
