import { Wallet as WalletIcon, TrendingUp, ArrowDownLeft } from "lucide-react";
import type { Screen } from "@/shared/types";
import { taskerApi } from "@/services/api";
import { useGoBack } from "@/app/routes/useGoBack";
import { useApi } from "@/shared/hooks";
import { TopBar } from "@/shared/ui";
import { formatVnd, formatDateVn } from "@/shared/lib";

export function ProviderIncome({ onNavigate: _onNavigate }: { onNavigate: (s: Screen, d?: object) => void }) {
  const goBack = useGoBack("providerDashboard");
  const { data: income, loading } = useApi(() => taskerApi.getTaskerIncome());

  const entries = income?.entries ?? [];

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Thu nhập của tôi" onBack={goBack} />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Balance card */}
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl p-5 text-white shadow-lg shadow-emerald-200">
          <div className="flex items-center gap-2 text-emerald-100 text-sm mb-1">
            <WalletIcon className="w-4 h-4" />
            Số dư ví (thực nhận sau hoa hồng)
          </div>
          <p className="text-3xl font-extrabold">
            {loading && !income ? "…" : `${formatVnd(income?.balance ?? 0)}đ`}
          </p>
          <div className="flex items-center gap-1.5 mt-3 text-emerald-100 text-xs">
            <TrendingUp className="w-3.5 h-3.5" />
            Tổng đã nhận: {formatVnd(income?.totalEarned ?? 0)}đ
          </div>
        </div>

        {/* History */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-bold text-foreground mb-3">Lịch sử thu nhập</h3>
          {loading && !income ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center gap-1 py-8 text-center">
              <p className="text-sm text-muted-foreground">Chưa có khoản thu nhập nào.</p>
              <p className="text-xs text-muted-foreground">
                Thu nhập được ghi có khi bạn hoàn thành đơn.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {entries.map((e) => (
                <div key={e.transactionId} className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                      <ArrowDownLeft className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {e.serviceSummary}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        BK{e.bookingId} · {formatDateVn(e.createdAt)}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-green-600 flex-shrink-0">
                      +{formatVnd(e.net)}đ
                    </p>
                  </div>
                  {/* Chi tiết: gộp → hoa hồng → thực nhận */}
                  <div className="mt-2 ml-12 flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span>Gộp: {formatVnd(e.gross)}đ</span>
                    <span className="text-red-500">− Hoa hồng: {formatVnd(e.commission)}đ</span>
                    <span className="ml-auto">Số dư: {formatVnd(e.balanceAfter)}đ</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
