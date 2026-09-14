"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useState } from "react";
import { createSchool, editSchool } from "@/app/more/schools/actions";
import { Button } from "@/components/ui/button";
import { schoolFormSchema, type SchoolMutationResult } from "@/lib/validation/school";

type Props = { mode: "create"; submissionId: string } | { mode: "edit"; id: string; name: string };

export function SchoolForm(props: Props) {
  const router = useRouter();
  const [name, setName] = useState(props.mode === "edit" ? props.name : "");
  const [result, action, pending] = useActionState<SchoolMutationResult | null, FormData>(async () => {
    const parsed = schoolFormSchema.safeParse({ name });
    if (!parsed.success) return { success: false, message: "请检查学校名称。", nameError: parsed.error.issues[0].message };
    try {
      const saved = props.mode === "create"
        ? await createSchool({ name, submissionId: props.submissionId })
        : await editSchool({ name, id: props.id });
      if (saved.success) router.replace(`/more/schools/${saved.id}?${props.mode === "create" ? "created" : "updated"}=1`);
      return saved;
    } catch {
      return { success: false, message: "暂时无法确认保存结果，请使用此表单重试。" };
    }
  }, null);
  const nameError = result && !result.success ? result.nameError : undefined;
  return <form action={action} className="space-y-5">
    <noscript><p>请启用 JavaScript 以填写学校资料。</p></noscript>
    {result && !result.success && <p role="alert" className="text-sm text-red-700">{result.message}</p>}
    {result?.success && <p role="status" className="text-sm text-green-800">学校已保存。</p>}
    <fieldset disabled={pending || !!result?.success} className="space-y-5 disabled:opacity-70">
      <div>
        <label htmlFor="school-name" className="text-sm font-medium">学校名称 <span aria-hidden="true">*</span></label>
        <input id="school-name" name="name" value={name} onChange={(event) => setName(event.target.value)} required maxLength={200} autoComplete="off"
          aria-invalid={!!nameError} aria-describedby={nameError ? "school-name-error" : undefined}
          className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base focus-visible:outline-2 focus-visible:outline-blue-700 aria-invalid:border-red-600" />
        {nameError && <p id="school-name-error" role="alert" className="mt-1 text-sm text-red-700">{nameError}</p>}
      </div>
      <Button type="submit" className="min-h-12 w-full bg-blue-700 text-white hover:bg-blue-800 sm:w-auto sm:px-6">
        {pending ? "正在保存…" : result?.success ? "已保存" : props.mode === "create" ? "添加学校" : "保存更改"}
      </Button>
    </fieldset>
    <Link href={props.mode === "create" ? "/more/schools" : `/more/schools/${props.id}`} className="inline-flex min-h-12 items-center text-sm text-slate-600 underline">取消</Link>
  </form>;
}
