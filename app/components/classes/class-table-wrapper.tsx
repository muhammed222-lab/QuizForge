// components/classes/client-table-wrapper.tsx
"use client";

import { DataTable } from "./data-table";
import { columns } from "./columns-client";
import type { Class } from "./columns-types";

export function ClassTableWrapper({ data }: { data: Class[] }) {
  return <DataTable columns={columns} data={data} />;
}
