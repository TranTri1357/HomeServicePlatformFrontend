import { toast } from "sonner";
import { getErrorMessage } from "./errors";

/**
 * Thin, app-wide wrapper over sonner for consistent notifications.
 * Use `notify.success` after a successful create/update/delete and
 * `notify.error(err)` inside a catch block — it extracts the backend message.
 *
 * Requires <Toaster /> mounted once (see AppProviders).
 */
export const notify = {
  success(message: string) {
    return toast.success(message);
  },
  error(err: unknown, fallback = "Đã có lỗi xảy ra") {
    return toast.error(getErrorMessage(err, fallback));
  },
  info(message: string) {
    return toast(message);
  },
  /** Returns a toast id; pass it to `notify.dismiss(id)` when the work finishes. */
  loading(message: string) {
    return toast.loading(message);
  },
  dismiss(id?: string | number) {
    toast.dismiss(id);
  },
};
