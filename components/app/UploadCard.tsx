"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, X } from "lucide-react";

import { buttonClass } from "@/components/ui/Button";
import { marketplaces } from "@/lib/brand";
import { cn } from "@/lib/utils";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/heic"];

/**
 * The dashboard's main card (SPEC.md §9). Files never leave the browser —
 * v1 does no real processing, so there is nothing to upload them for.
 */
export function UploadCard() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [marketplace, setMarketplace] = useState<string>("amazon");

  const addFiles = useCallback((incoming: FileList | null) => {
    if (!incoming) return;
    const accepted = Array.from(incoming).filter(
      (file) => ACCEPTED.includes(file.type) || /\.heic$/i.test(file.name),
    );
    if (accepted.length > 0) setFiles((current) => [...current, ...accepted]);
  }, []);

  return (
    <div className="rounded-card border border-border bg-white p-6 max-mob:p-5">
      <h2 className="text-[19px]">Prepare Product Photos</h2>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          addFiles(event.dataTransfer.files);
        }}
        className={cn(
          "mt-4 flex flex-col items-center justify-center rounded-card border border-dashed px-6 py-11 text-center transition-colors duration-150 max-mob:py-9",
          dragging ? "border-accent bg-accent-tint" : "border-border-strong bg-surface",
        )}
      >
        <ImagePlus width={22} height={22} strokeWidth={1.5} className="text-muted" />
        <p className="mt-3 text-[15px] text-ink">Drop product photos here or</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-1 text-[15px] font-medium text-ink underline underline-offset-4 hover:text-accent"
        >
          browse
        </button>
        <p className="mt-2.5 text-[12.5px] text-muted">JPG, PNG, WebP or HEIC</p>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,.heic"
          multiple
          hidden
          onChange={(event) => {
            addFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      {files.length > 0 ? (
        <ul className="mt-3 flex flex-col gap-1.5">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center justify-between gap-3 rounded-ctl border border-border px-3 py-2 text-[13.5px]"
            >
              <span className="truncate text-ink">{file.name}</span>
              <button
                type="button"
                aria-label={`Remove ${file.name}`}
                onClick={() => setFiles((current) => current.filter((_, i) => i !== index))}
                className="flex-none text-muted hover:text-ink"
              >
                <X width={14} height={14} strokeWidth={1.8} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {marketplaces.slice(0, 6).map((item) => {
          const active = item.id === marketplace;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setMarketplace(item.id)}
              aria-pressed={active}
              className={cn(
                "rounded-full border px-[13px] py-[6px] text-[13px] transition-colors duration-150",
                active
                  ? "border-accent bg-accent-tint font-medium text-ink"
                  : "border-border text-body hover:border-border-strong hover:text-ink",
              )}
            >
              {item.name}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={files.length === 0}
        onClick={() => router.push(`/dashboard/editor?marketplace=${marketplace}`)}
        className={buttonClass({ className: "mt-5 max-mob:w-full disabled:cursor-not-allowed disabled:opacity-45" })}
      >
        Continue
      </button>
    </div>
  );
}
