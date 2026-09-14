import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata: Metadata = { title: "报告" };

export default function Page() {
  return <PlaceholderPage title="报告" description="托育记录与可打印的托育表。" />;
}
