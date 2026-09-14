import { contentLines } from "@/lib/workflow-display";
export function DictationContent({ text, format = "PLAIN" }: { text: string; format?: string }) {
  return format === "NUMBERED" ? <ol className="list-decimal space-y-1 pl-6 break-words">{contentLines(text).map((line, index) => <li key={index}>{line}</li>)}</ol> : <p className="whitespace-pre-wrap break-words">{text}</p>;
}
