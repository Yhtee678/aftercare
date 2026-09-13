import Link from "next/link";

export default function NotFound() {
  return <div className="space-y-4">
    <h1 className="text-2xl font-semibold">School not found</h1>
    <p className="text-sm text-slate-600">This school link is invalid or the school is unavailable.</p>
    <Link href="/more/schools" className="inline-flex min-h-12 items-center text-blue-700 underline">Back to Schools</Link>
  </div>;
}
