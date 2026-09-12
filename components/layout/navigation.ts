import { BookOpen, CalendarDays, ClipboardList, FileText, HeartHandshake, MoreHorizontal, Users } from "lucide-react";

export const navigationItems = [
  { href: "/today", label: "Today", icon: CalendarDays, mobile: true },
  { href: "/students", label: "Students", icon: Users, mobile: true },
  { href: "/homework", label: "Homework", icon: ClipboardList, mobile: true },
  { href: "/care", label: "Care", icon: HeartHandshake, mobile: true },
  { href: "/answers", label: "Answers", icon: BookOpen, mobile: false },
  { href: "/reports", label: "Reports", icon: FileText, mobile: false },
  { href: "/more", label: "More", icon: MoreHorizontal, mobile: true },
] as const;
