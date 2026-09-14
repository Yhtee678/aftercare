"use client";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export function DictationPhoto({ context }: { context: string }) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const url = useRef<string | null>(null);
  const [photo, setPhoto] = useState<{ file: File; url: string } | null>(null);
  const [message, setMessage] = useState("");
  const [sharing, setSharing] = useState(false);
  const clear = () => { if (url.current) URL.revokeObjectURL(url.current); url.current = null; setPhoto(null); if (input.current) input.current.value = ""; };
  useEffect(() => {
    // Clear on page lifecycle changes too: browsers may retain a page in their back cache.
    const leave = () => { if (url.current) URL.revokeObjectURL(url.current); url.current = null; setPhoto(null); if (input.current) input.current.value = ""; };
    window.addEventListener("pagehide", leave);
    return () => { window.removeEventListener("pagehide", leave); if (url.current) URL.revokeObjectURL(url.current); };
  }, []);
  const share = async () => {
    if (!photo || sharing) return;
    if (!navigator.canShare?.({ files: [photo.file] })) { setMessage("此浏览器不支持照片分享。请在手机相册或相机中分享原照片，并复制下方学生资料；系统不会保存照片。"); return; }
    setSharing(true);
    try { await navigator.share({ files: [photo.file], text: context, title: "听写照片" }); setMessage("已打开系统分享，请在所选应用中确认发送。"); }
    catch (error) { setMessage(error instanceof DOMException && error.name === "AbortError" ? "已取消分享。" : "暂时无法分享，请重试或从手机相册分享原照片。"); }
    finally { setSharing(false); }
  };
  return <details onToggle={(event) => { if (!event.currentTarget.open) clear(); }} className="border-t pt-2"><summary className="min-h-12 cursor-pointer py-3 text-sm text-blue-700">听写照片</summary><div className="space-y-3">
    <label htmlFor={id} className="block text-sm font-medium">{photo ? "重新拍摄／选择照片" : "拍照／选择照片"}</label>
    <input ref={input} id={id} type="file" accept="image/*" capture="environment" className="min-h-12 max-w-full text-sm" disabled={sharing} onChange={(event) => {
      const file = event.target.files?.[0]; if (!file) return;
      clear(); setMessage("");
      if (!file.type.startsWith("image/")) { setMessage("请选择照片文件。"); return; }
      const localUrl = URL.createObjectURL(file); url.current = localUrl; setPhoto({ file, url: localUrl });
    }} />
    {photo && <><div>
      {/* Local blob only; never pass this through an image server. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo.url} alt="本次听写照片预览" className="max-h-80 rounded-lg object-contain" />
    </div><Button type="button" disabled={sharing} onClick={share} className="min-h-12">{sharing ? "正在分享…" : "分享给负责人"}</Button><Button type="button" variant="outline" disabled={sharing} onClick={clear} className="ml-2 min-h-12">移除照片</Button></>}
    <p className="text-xs text-slate-600">照片仅用于本次分享，不会上传或保存到系统。</p><p className="select-all whitespace-pre-line text-sm">{context}</p>{message && <p role="status" className="text-sm">{message}</p>}
  </div></details>;
}
