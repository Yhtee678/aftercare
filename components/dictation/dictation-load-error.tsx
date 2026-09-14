import Link from "next/link";

export function DictationLoadError({ href = "/dictation" }: { href?: string }) {
  return <div className="space-y-4"><h1 className="text-2xl font-semibold">Dictation unavailable</h1>
    <p role="alert">Unable to load dictation. Please try again.</p>
    <Link href={href} className="inline-flex min-h-12 items-center text-blue-700 underline">Try again</Link>
  </div>;
}
