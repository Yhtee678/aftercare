import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata: Metadata = { title: "Reports" };

export default function Page() {
  return <PlaceholderPage title="Reports" description="Daily care records and printable care sheets." />;
}
