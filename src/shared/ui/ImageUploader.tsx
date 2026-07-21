import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { uploadApi } from "@/services/api";
import type { UploadFolder } from "@/services/api/upload.api";
import { getApiAssetUrl, notify, getErrorMessage, cn } from "@/shared/lib";

interface ImageUploaderProps {
  
  value: string | null;
  
  onChange: (url: string | null) => void;
  
  folder: UploadFolder;
  
  shape?: "square" | "circle";
  
  hint?: string;
}


export function ImageUploader({ value, onChange, folder, shape = "square", hint }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const previewUrl = value ? getApiAssetUrl(value) : "";
  const rounded = shape === "circle" ? "rounded-full" : "rounded-xl";

  const handlePick = () => inputRef.current?.click();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; 
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadApi.uploadImage(file, folder);
      onChange(url);
      notify.success("Tải ảnh lên thành công");
    } catch (err) {
      notify.error(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "relative w-20 h-20 flex-shrink-0 border border-border bg-muted overflow-hidden flex items-center justify-center",
            rounded,
          )}
        >
          {previewUrl ? (
            <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
          ) : (
            <ImagePlus className="w-6 h-6 text-muted-foreground" />
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handlePick}
            disabled={uploading}
            className="px-3 py-1.5 text-sm font-semibold rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-60 flex items-center gap-1.5"
          >
            <ImagePlus className="w-4 h-4" />
            {value ? "Đổi ảnh" : "Chọn ảnh"}
          </button>
          {value && !uploading && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="px-3 py-1.5 text-sm font-semibold rounded-lg text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1.5"
            >
              <X className="w-4 h-4" /> Gỡ ảnh
            </button>
          )}
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground">
        {hint ?? "JPG, PNG, WEBP hoặc GIF, tối đa 3MB."}
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={(e) => void handleFile(e)}
        className="hidden"
      />
    </div>
  );
}
