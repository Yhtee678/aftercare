import Link from "next/link";

export default function NotFound() {
  return <div className="space-y-4">
    <h1 className="text-2xl font-semibold">Student not found</h1>
    <p className="text-sm text-slate-600">This student link is invalid or the student is unavailable.</p>
    <Link href="/students" className="inline-flex min-h-12 items-center text-blue-700 underline">Back to Students</Link>
  </div>;
}
