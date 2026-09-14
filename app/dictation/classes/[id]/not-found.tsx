import Link from "next/link";

export default function NotFound() {
  return <div className="space-y-4"><h1 className="text-2xl font-semibold">找不到班级</h1><p>班级链接无效或班级不存在。</p><Link href="/dictation" className="inline-flex min-h-12 items-center text-blue-700 underline">返回年级与班级</Link></div>;
}
