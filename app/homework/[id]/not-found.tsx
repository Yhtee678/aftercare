import Link from "next/link";
export default function NotFound() {
  return <div className="space-y-4"><h1 className="text-2xl font-semibold">找不到功课</h1><p>链接无效或任务不存在。</p><Link href="/homework" className="inline-flex min-h-12 items-center text-blue-700 underline">返回功课</Link></div>;
}
