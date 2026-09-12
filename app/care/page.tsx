import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata: Metadata = { title: "Care" };

export default function Page() {
  return <PlaceholderPage title="Care" description="The daily care workflow, from arrival to release." />;
}
