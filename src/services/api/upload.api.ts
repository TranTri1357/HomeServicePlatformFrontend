import { postForm, unwrap, type ApiResponse } from "./client";

/** Nhóm ảnh trên Cloudinary (khớp whitelist ở backend). */
export type UploadFolder = "categories" | "services" | "taskers";

interface UploadImageResult {
  url: string;
}

/**
 * Tải 1 ảnh lên Cloudinary qua backend và nhận URL.
 *
 * Hai đường vì quyền khác nhau: ảnh danh mục/dịch vụ qua route Admin, còn ảnh giấy tờ
 * xác minh của thợ qua route Tasker (thợ không có quyền ghi vào folder danh mục/dịch vụ).
 */
export async function uploadImage(file: File, folder: UploadFolder): Promise<string> {
  const form = new FormData();
  form.append("file", file);

  const response =
    folder === "taskers"
      ? await postForm<ApiResponse<UploadImageResult>>("/tasker/uploads/image", form)
      : await postForm<ApiResponse<UploadImageResult>>("/admin/uploads/image", form, {
          params: { folder },
        });

  return unwrap(response).url;
}
