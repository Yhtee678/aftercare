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
          <h2 className="text-base font-medium">Coming soon</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            This section is a placeholder. {title === "More" ? "Additional tools" : title} features are not available yet.
          </p>
        </CardContent>
      </Card>
      {children}
    </div>
  );
}
