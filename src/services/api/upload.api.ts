import { postForm, unwrap, type ApiResponse } from "./client";


export type UploadFolder = "categories" | "services" | "taskers";

interface UploadImageResult {
  url: string;
}


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
