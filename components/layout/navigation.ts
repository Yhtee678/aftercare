import { BookOpen, CalendarDays, ClipboardList, FileText, HeartHandshake, MoreHorizontal, Users } from "lucide-react";

export const navigationItems = [
  { href: "/today", label: "今日", icon: CalendarDays, mobile: true },
  { href: "/dictation", label: "听写", icon: BookOpen, mobile: false },
  { href: "/homework", label: "功课", icon: ClipboardList, mobile: true },
  { href: "/students", label: "学生", icon: Users, mobile: true },
  { href: "/care", label: "托育", icon: HeartHandshake, mobile: true },
  { href: "/answers", label: "答案资料", icon: BookOpen, mobile: false },
  { href: "/reports", label: "报告", icon: FileText, mobile: false },
  { href: "/more", label: "更多", icon: MoreHorizontal, mobile: true },
] as const;
