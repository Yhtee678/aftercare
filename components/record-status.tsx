import { Badge } from "@/components/ui/badge";

export function RecordStatus({ status }: { status: "ACTIVE" | "INACTIVE" }) {
  return <Badge variant="secondary" className={status === "ACTIVE" ? "bg-green-50 text-green-800" : "bg-slate-100 text-slate-600"}>
    {status === "ACTIVE" ? "启用中" : "已停用"}
  </Badge>;
}
