import Link from "next/link";

export default function NotFound() {
  return <div className="space-y-4"><h1 className="text-2xl font-semibold">School class not found</h1>
    <p className="text-sm text-slate-600">This class link is invalid or the class is unavailable.</p>
    <Link href="/more/classes" className="inline-flex min-h-12 items-center text-blue-700 underline">Back to Classes</Link>
  </div>;
}
