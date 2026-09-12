import { LoaderCircle } from "lucide-react";

export default function Loading() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Students</h1>
      <p role="status" className="flex items-center gap-2 text-sm text-slate-600">
        <LoaderCircle aria-hidden="true" className="size-4 motion-safe:animate-spin" />
        Loading students…
      </p>
    </div>
  );
}
