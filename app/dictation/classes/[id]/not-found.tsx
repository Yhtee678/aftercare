import Link from "next/link";

export default function NotFound() {
  return <div className="space-y-4"><h1 className="text-2xl font-semibold">Class not found</h1><p>This class link is invalid or unavailable.</p><Link href="/dictation" className="inline-flex min-h-12 items-center text-blue-700 underline">Back to Grades and Classes</Link></div>;
}
