import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

export function PlaceholderPage({ title, description, children }: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
      </div>
      <Card className="max-w-2xl shadow-none">
        <CardContent className="py-4">
          <h2 className="text-base font-medium">即将推出</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            此功能正在准备中。 {title === "更多" ? "更多工具" : title} 功能暂未开放。
          </p>
        </CardContent>
      </Card>
      {children}
    </div>
  );
}
