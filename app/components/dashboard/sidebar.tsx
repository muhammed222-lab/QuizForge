import Link from "next/link";
import { Book, Calendar, FileText, Home, Settings, Users } from "lucide-react";
import { cn } from "../../../lib/utils";
import { buttonVariants } from "@/components/ui/button";

export default function DashboardSidebar() {
  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      name: "Classes",
      href: "/dashboard/classes",
      icon: Book,
    },
    {
      name: "Exams",
      href: "/dashboard/exams",
      icon: FileText,
    },
    {
      name: "Students",
      href: "/dashboard/students",
      icon: Users,
    },
    {
      name: "Schedule",
      href: "/dashboard/schedule",
      icon: Calendar,
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ];

  return (
    <aside className="hidden w-64 border-r bg-background md:block">
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <h2 className="text-lg font-semibold tracking-tight">QuizForge</h2>
        </div>
        <div className="px-3 py-2">
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "w-full justify-start gap-2"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
