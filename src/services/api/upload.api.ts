import { postForm, unwrap, type ApiResponse } from "./client";

/** Nhóm ảnh trên Cloudinary (khớp whitelist ở backend). */
export type UploadFolder = "categories" | "services";

interface UploadImageResult {
  url: string;
}

/**
 * POST /api/admin/uploads/image — tải 1 ảnh lên Cloudinary qua backend (chỉ Admin) và nhận URL.
 * Dùng cho ảnh danh mục / dịch vụ; URL trả về đem lưu vào iconUrl / imageUrl.
 */
export async function uploadImage(file: File, folder: UploadFolder): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const response = await postForm<ApiResponse<UploadImageResult>>(
    "/admin/uploads/image",
    form,
    { params: { folder } },
  );
  return unwrap(response).url;
}
