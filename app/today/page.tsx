import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata: Metadata = { title: "Today" };

export default function Page() {
  return <PlaceholderPage title="Today" description="Who still needs the teacher’s attention right now?" />;
}
