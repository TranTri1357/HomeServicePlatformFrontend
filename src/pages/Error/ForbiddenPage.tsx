import { ShieldAlert, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers";

export function ForbiddenPage() {
  const navigate = useNavigate();
  const { getHomePath } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 flex items-center justify-center mb-5">
          <ShieldAlert className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">403 - Không có quyền truy cập</h1>
        <p className="text-sm text-slate-500 mb-6">
          Tài khoản của bạn không có quyền truy cập khu vực này.
        </p>
        <button
          type="button"
          onClick={() => navigate(getHomePath(), { replace: true })}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          <Home className="w-4 h-4" />
          Về trang chính
        </button>
      </div>
    </div>
  );
}
