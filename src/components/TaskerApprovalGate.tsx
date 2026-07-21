import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, XCircle, ShieldAlert, AlertCircle, FileCheck2, FilePlus2 } from "lucide-react";
import type { TaskerProfileData } from "@/shared/types";
import { taskerApi } from "@/services/api";
import { ApiError } from "@/services/api/client";
import { useAuth } from "@/app/providers";
import { getPathForScreen } from "@/app/routes/screenPaths";
import { getErrorMessage } from "@/shared/lib";

export interface TaskerApproval {
  status: number | undefined;
  approved: boolean;
  hasProfile: boolean;
  rejectionReason: string | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTaskerApproval(): TaskerApproval {
  const { user } = useAuth();
  const userId = user?.userId ?? 0;

  const [profile, setProfile] = useState<TaskerProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    if (userId <= 0) {
      setLoading(false);
      setNotFound(true);
      return;
    }
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const data = await taskerApi.getMyTaskerProfile(userId);
      setProfile(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setProfile(null);
        setNotFound(true);
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const status = profile?.status;

  return {
    status,
    approved: status === 1 || status === 3,
    hasProfile: profile != null && !notFound,
    rejectionReason: profile?.rejectionReason ?? null,
    loading,
    error,
    refetch: () => void load(),
  };
}

const STATUS_NOTICE: Record<
  number,
  { icon: typeof Clock; iconClass: string; title: string; description: string }
> = {
  0: {
    icon: Clock,
    iconClass: "text-amber-500 bg-amber-100",
    title: "Hồ sơ đang chờ duyệt",
    description:
      "Hồ sơ của bạn đang chờ quản trị viên phê duyệt. Sau khi được duyệt, bạn mới có thể thiết lập lịch làm việc và đăng ký dịch vụ.",
  },
  2: {
    icon: ShieldAlert,
    iconClass: "text-red-500 bg-red-100",
    title: "Tài khoản đang bị tạm khóa",
    description:
      "Tài khoản thợ của bạn đang bị tạm khóa nên chưa thể thiết lập lịch và đăng ký dịch vụ. Vui lòng liên hệ quản trị viên để được hỗ trợ.",
  },
  4: {
    icon: XCircle,
    iconClass: "text-red-500 bg-red-100",
    title: "Hồ sơ bị từ chối",
    description:
      "Hồ sơ của bạn đã bị từ chối. Vui lòng bổ sung thông tin và nộp lại để được duyệt.",
  },
};

const NO_PROFILE_NOTICE = {
  icon: FilePlus2,
  iconClass: "text-blue-500 bg-blue-100",
  title: "Bạn chưa có hồ sơ thợ",
  description:
    "Bạn cần hoàn thiện và gửi hồ sơ thợ để được quản trị viên duyệt trước khi thiết lập lịch làm việc và đăng ký dịch vụ.",
};

export function TaskerApprovalNotice({ approval }: { approval: TaskerApproval }) {
  const navigate = useNavigate();
  const { status, hasProfile, rejectionReason, loading, error, refetch } = approval;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 animate-pulse" />
        <div className="w-48 h-4 rounded bg-slate-100 animate-pulse" />
        <div className="w-64 h-3 rounded bg-slate-100 animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-sm text-muted-foreground">{error}</p>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const notice = !hasProfile ? NO_PROFILE_NOTICE : STATUS_NOTICE[status ?? 0] ?? STATUS_NOTICE[0];
  const Icon = notice.icon;
  const isRejected = hasProfile && status === 4;
  const showProfileButton = !hasProfile || isRejected;
  const description =
    isRejected && rejectionReason ? `Lý do: ${rejectionReason}` : notice.description;

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 px-6 text-center">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${notice.iconClass}`}>
        <Icon className="w-8 h-8" />
      </div>
      <div className="space-y-1.5 max-w-md">
        <h3 className="text-lg font-bold text-foreground">{notice.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
      {showProfileButton && (
        <button
          onClick={() => navigate(getPathForScreen("providerProfile"))}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          <FileCheck2 className="w-4 h-4" />
          {isRejected ? "Nộp lại hồ sơ" : "Hoàn thiện hồ sơ"}
        </button>
      )}
    </div>
  );
}
