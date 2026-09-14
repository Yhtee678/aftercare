import { LoaderCircle } from "lucide-react";

export default function Loading() {
  return <div role="status" className="flex items-center gap-3 text-sm text-slate-600">
    <LoaderCircle aria-hidden="true" className="size-5 animate-spin motion-reduce:animate-none" /> 正在加载学校资料…
  </div>;
}
