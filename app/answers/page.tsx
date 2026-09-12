import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata: Metadata = { title: "Answers" };

export default function Page() {
  return <PlaceholderPage title="Answers" description="Answer resources for teacher reference." />;
}
