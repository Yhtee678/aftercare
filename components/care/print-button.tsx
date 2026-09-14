"use client";
import { Button } from "@/components/ui/button";
export function PrintButton() { return <Button onClick={() => window.print()} className="min-h-12 print:hidden">打印／另存为 PDF</Button>; }
