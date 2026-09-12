import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata: Metadata = { title: "Students" };

export default function Page() {
  return <PlaceholderPage title="Students" description="Shared student context for the teachers who care for them." />;
}
