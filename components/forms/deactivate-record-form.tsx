"use client";

import { useActionState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
type DeactivationResult = { success: true; id: string } | { success: false; message: string };

export function DeactivateRecordForm({ name, label, description, successMessage, confirmAction, successHref }: {
  name: string; label: string; description: string; successMessage: string;
  confirmAction: (confirmed: boolean) => Promise<DeactivationResult>;
  successHref: (id: string) => string;
}) {
  const router = useRouter();
  const details = useRef<HTMLDetailsElement>(null);
  const [result, formAction, pending] = useActionState<DeactivationResult | null, FormData>(async (_previous, formData) => {
    try {
      const result = await confirmAction(formData.get("confirmed") === "yes");
      if (result.success) router.replace(successHref(result.id));
      return result;
    } catch {
      return { success: false, message: "Unable to confirm deactivation. Please try again; repeating it is safe." };
    }
  }, null);

  return <details ref={details} className="rounded-xl border border-slate-200 bg-white p-4">
    <summary className="min-h-12 cursor-pointer content-center rounded-lg text-sm font-medium focus-visible:outline-2 focus-visible:outline-blue-700">{label}</summary>
    <form action={formAction} className="space-y-4 pt-3">
      <p className="break-words font-medium">Deactivate {name}?</p>
      <p className="text-sm leading-6 text-slate-600">{description}</p>
      <noscript><p>Enable JavaScript to confirm deactivation.</p></noscript>
      {result && !result.success && <p role="alert" className="text-sm text-red-700">{result.message}</p>}
      {result?.success && <p role="status" className="text-sm text-green-800">{successMessage}</p>}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="button" variant="outline" disabled={pending || !!result?.success} className="min-h-12" onClick={() => {
          if (details.current) {
            details.current.open = false;
            details.current.querySelector("summary")?.focus();
          }
        }}>Cancel</Button>
        <Button type="submit" name="confirmed" value="yes" disabled={pending || !!result?.success} className="min-h-12 bg-slate-800 text-white hover:bg-slate-900">
          {pending ? "Deactivating…" : "Confirm deactivation"}
        </Button>
      </div>
    </form>
  </details>;
}
