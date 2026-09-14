import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata: Metadata = { title: "答案资料" };

export default function Page() {
  return <PlaceholderPage title="答案资料" description="供老师查阅的答案资料。" />;
}
