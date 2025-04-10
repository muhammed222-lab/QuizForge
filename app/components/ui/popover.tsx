"use client";

import * as React from "react";

const Popover = ({ children }: { children: React.ReactNode }) => {
  return <div className="relative">{children}</div>;
};

const PopoverTrigger = ({ children }: { children: React.ReactNode }) => {
  return <div className="cursor-pointer">{children}</div>;
};

const PopoverContent = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="absolute z-10 mt-2 w-48 p-4 bg-white border rounded-md shadow-md">
      {children}
    </div>
  );
};

export { Popover, PopoverTrigger, PopoverContent };
