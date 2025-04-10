/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useFormContext, Controller } from "react-hook-form";
import { cn } from "../../../lib/utils";
import { Label } from "./label";

export function Form({
  children,
  ...props
}: React.FormHTMLAttributes<HTMLFormElement>) {
  return <form {...props}>{children}</form>;
}

export function FormItem({ children }: { children: React.ReactNode }) {
  return <div className="space-y-2">{children}</div>;
}

export function FormLabel({ children }: { children: React.ReactNode }) {
  return <Label>{children}</Label>;
}

export function FormControl({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

export function FormMessage({ children }: { children?: React.ReactNode }) {
  return children ? <p className="text-sm text-red-500">{children}</p> : null;
}

export function FormField({ name, control, render }: any) {
  return <Controller name={name} control={control} render={render} />;
}
