import Link from "next/link";

export default function NotFound() {
  return <div className="space-y-4">
    <h1 className="text-2xl font-semibold">找不到学生</h1>
    <p className="text-sm text-slate-600">学生链接无效或学生不存在。</p>
    <Link href="/students" className="inline-flex min-h-12 items-center text-blue-700 underline">返回学生</Link>
  </div>;
}
