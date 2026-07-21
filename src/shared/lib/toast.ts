import { toast } from "sonner";
import { getErrorMessage } from "./errors";


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
  
  loading(message: string) {
    return toast.loading(message);
  },
  dismiss(id?: string | number) {
    toast.dismiss(id);
  },
};
