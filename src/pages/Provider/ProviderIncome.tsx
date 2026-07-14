import { useState } from "react";
import {
  Wallet as WalletIcon,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  Loader2,
} from "lucide-react";
import type { Screen } from "@/shared/types";
import { taskerApi } from "@/services/api";
import { useGoBack } from "@/app/routes/useGoBack";
import { useApi } from "@/shared/hooks";
import { TopBar } from "@/shared/ui";
import { formatVnd, formatDateVn, notify, getErrorMessage } from "@/shared/lib";

const QUICK_AMOUNTS = [100_000, 200_000, 500_000, 1_000_000];
const MIN_WITHDRAW = 50_000;

// Loại giao dịch ví → nhãn + có ghi có (credit) hay ghi nợ (debit).
const TX: Record<number, { label: string; credit: boolean }> = {
  1: { label: "Nạp tiền", credit: true },
  2: { label: "Thanh toán", credit: false },
  3: { label: "Hoàn tiền", credit: true },
  4: { label: "Thu nhập", credit: true },
  5: { label: "Rút tiền", credit: false },
  6: { label: "Điều chỉnh", credit: true },
};

export function ProviderIncome({ onNavigate: _onNavigate }: { onNavigate: (s: Screen, d?: object) => void }) {
  const goBack = useGoBack("providerDashboard");
  const { data: income, loading, refetch } = useApi(() => taskerApi.getTaskerIncome());

  const [amount, setAmount] = useState<number>(QUICK_AMOUNTS[0]);
  const [withdrawing, setWithdrawing] = useState(false);

  const balance = income?.balance ?? 0;
  const entries = income?.entries ?? [];

  const handleWithdraw = async () => {
    if (amount < MIN_WITHDRAW) {
      notify.error(`Số tiền rút tối thiểu là ${formatVnd(MIN_WITHDRAW)}đ.`);
      return;
    }
    if (amount > balance) {
      notify.error("Số dư ví không đủ để rút số tiền này.");
      return;
    }
    setWithdrawing(true);
    try {
      const newBalance = await taskerApi.withdrawIncome(amount);
      notify.success(`Rút thành công! Số dư còn lại: ${formatVnd(newBalance)}đ`);
      void refetch();
    } catch (err) {
      notify.error(getErrorMessage(err));
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Ví thu nhập" onBack={goBack} />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Balance card */}
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl p-5 text-white shadow-lg shadow-emerald-200">
          <div className="flex items-center gap-2 text-emerald-100 text-sm mb-1">
            <WalletIcon className="w-4 h-4" />
            Số dư ví (thực nhận sau hoa hồng)
          </div>
          <p className="text-3xl font-extrabold">
            {loading && !income ? "…" : `${formatVnd(balance)}đ`}
          </p>
          <div className="flex items-center gap-1.5 mt-3 text-emerald-100 text-xs">
            <TrendingUp className="w-3.5 h-3.5" />
            Tổng đã nhận: {formatVnd(income?.totalEarned ?? 0)}đ
          </div>
        </div>

        {/* Withdraw */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-bold text-foreground mb-3">Rút tiền về tài khoản</h3>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {QUICK_AMOUNTS.map((a) => (
              <button
                key={a}
                onClick={() => setAmount(a)}
                className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors ${amount === a ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-transparent bg-muted text-foreground"}`}
              >
                {formatVnd(a)}đ
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2.5 mb-3">
            <input
              type="number"
              min={0}
              value={amount || ""}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
              className="flex-1 bg-transparent text-sm focus:outline-none text-foreground"
              placeholder="Số tiền khác"
            />
            <span className="text-sm text-muted-foreground">đ</span>
          </div>
          <button
            onClick={handleWithdraw}
            disabled={withdrawing || balance <= 0}
            className="w-full py-3 bg-emerald-600 disabled:opacity-60 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
          >
            {withdrawing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Banknote className="w-4 h-4" />
            )}
            {withdrawing ? "Đang rút..." : `Rút ${formatVnd(amount)}đ`}
          </button>
          <p className="text-[11px] text-muted-foreground mt-2">
            Chế độ demo: tiền được trừ thẳng khỏi ví, chưa chuyển qua ngân hàng thật. Tối thiểu{" "}
            {formatVnd(MIN_WITHDRAW)}đ/lần.
          </p>
        </div>

        {/* History */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-bold text-foreground mb-3">Lịch sử giao dịch</h3>
          {loading && !income ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center gap-1 py-8 text-center">
              <p className="text-sm text-muted-foreground">Chưa có giao dịch nào.</p>
              <p className="text-xs text-muted-foreground">
                Thu nhập được ghi có khi bạn hoàn thành đơn.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {entries.map((e) => {
                const meta = TX[e.type] ?? { label: e.serviceSummary, credit: true };
                const isEarning = e.type === 4;
                return (
                  <div key={e.transactionId} className="py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.credit ? "bg-green-100" : "bg-red-100"}`}
                      >
                        {meta.credit ? (
                          <ArrowDownLeft className="w-4 h-4 text-green-600" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {e.serviceSummary || meta.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {e.bookingId ? `BK${e.bookingId} · ` : ""}
                          {formatDateVn(e.createdAt)}
                        </p>
                      </div>
                      <p
                        className={`text-sm font-bold flex-shrink-0 ${meta.credit ? "text-green-600" : "text-red-600"}`}
                      >
                        {meta.credit ? "+" : "-"}
                        {formatVnd(Math.abs(e.net))}đ
                      </p>
                    </div>

                    {/* Chi tiết chỉ cho dòng thu nhập: gộp → hoa hồng → thực nhận */}
                    {isEarning ? (
                      <div className="mt-2 ml-12 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                        <span>Gộp: {formatVnd(e.gross)}đ</span>
                        {e.cashReceived > 0 && (
                          <span>Tiền mặt: {formatVnd(e.cashReceived)}đ</span>
                        )}
                        <span className="text-red-500">− Hoa hồng: {formatVnd(e.commission)}đ</span>
                        <span className="ml-auto">Số dư: {formatVnd(e.balanceAfter)}đ</span>
                      </div>
                    ) : (
                      <div className="mt-1 ml-12 text-[11px] text-muted-foreground">
                        Số dư: {formatVnd(e.balanceAfter)}đ
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
