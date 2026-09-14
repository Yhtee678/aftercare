import Link from "next/link";

export function StudentLoadError({ retryHref }: { retryHref: string }) {
  return <div className="space-y-4">
    <h1 className="text-2xl font-semibold">学生资料</h1>
    <p role="alert" className="text-sm text-slate-600">暂时无法加载学生资料，请重试。</p>
    <a href={retryHref} className="inline-flex min-h-12 items-center text-blue-700 underline">重试</a>
    <Link href="/students" className="ml-6 inline-flex min-h-12 items-center text-slate-600 underline">返回学生</Link>
  </div>;
}
