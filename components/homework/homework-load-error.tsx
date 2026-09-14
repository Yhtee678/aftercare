import Link from "next/link";

export function HomeworkLoadError({ href = "/homework" }: { href?: string }) {
  return <div className="space-y-4"><h1 className="text-2xl font-semibold">暂时无法查看功课</h1>
    <p role="alert">暂时无法加载功课，请重试。</p>
    <Link href={href} className="inline-flex min-h-12 items-center text-blue-700 underline">重试</Link>
  </div>;
}
