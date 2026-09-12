import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata: Metadata = { title: "Homework" };

export default function Page() {
  return <PlaceholderPage title="Homework" description="School homework, teacher checks, and corrections." />;
}
