import { useCallback, useRef, useState } from "react";
import { Upload, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  file: File | null;
  onFile: (file: File | null) => void;
  disabled?: boolean;
}

export function UploadZone({ file, onFile, disabled }: UploadZoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files?.[0];
      if (f) onFile(f);
    },
    [onFile],
  );

  if (file) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-border bg-card/60 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-medium text-foreground">{file.name}</div>
            <div className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</div>
          </div>
        </div>
        <button
          onClick={() => onFile(null)}
          className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Remove file"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      disabled={disabled}
      className={cn(
        "flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 transition-all",
        "border-border bg-card/40 hover:border-primary/60 hover:bg-card/70",
        dragOver && "border-primary bg-primary/5",
        disabled && "opacity-60 cursor-not-allowed",
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Upload className="h-7 w-7" />
      </div>
      <div className="text-center">
        <div className="text-sm font-semibold text-foreground">
          Drop your resume here or click to browse
        </div>
        <div className="mt-1 text-xs text-muted-foreground">PDF, DOCX, or TXT · up to 5MB</div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.txt"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
      />
    </button>
  );
}