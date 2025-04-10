/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

export function toast({
  title,
  description,
  variant = "default",
}: {
  title: string;
  description?: string;
  variant?: string;
}) {
  alert(`${title}: ${description || ""}`);
}
