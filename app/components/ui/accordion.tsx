/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import * as React from "react";
import { cn } from "../../../lib/utils";

const Accordion = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <div className={cn("space-y-2", className)}>{children}</div>;
};

const AccordionItem = ({
  children,
  value,
}: {
  children: React.ReactNode;
  value: string;
}) => {
  return <div className="border rounded-md overflow-hidden">{children}</div>;
};

const AccordionTrigger = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <button
      onClick={() => setOpen(!open)}
      className="w-full text-left px-4 py-2 font-medium bg-muted hover:bg-muted/80"
    >
      {children}
    </button>
  );
};

const AccordionContent = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="px-4 py-2 border-t text-sm text-muted-foreground">
      {children}
    </div>
  );
};

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
