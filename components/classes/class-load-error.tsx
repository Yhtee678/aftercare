import Link from "next/link";

export function ClassLoadError({ retryHref }: { retryHref: string }) {
  return <div className="space-y-4">
    <h1 className="text-2xl font-semibold">School class information</h1>
    <p role="alert" className="text-sm text-slate-600">Unable to load class information. Please try again.</p>
    <a href={retryHref} className="inline-flex min-h-12 items-center text-blue-700 underline">Try again</a>
    <Link href="/more" className="ml-6 inline-flex min-h-12 items-center text-slate-600 underline">Back to More</Link>
  </div>;
}
