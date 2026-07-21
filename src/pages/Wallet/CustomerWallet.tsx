import { useState } from "react";
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, QrCode } from "lucide-react";
import { walletApi } from "@/services/api";
import { useGoBack } from "@/app/routes/useGoBack";
import { useGatedNavigate } from "@/app/routes/useGatedNavigate";
import { useApi } from "@/shared/hooks";
import { TopBar } from "@/shared/ui";
import { formatVnd, formatDateVn, notify } from "@/shared/lib";

const QUICK_AMOUNTS = [100_000, 200_000, 500_000, 1_000_000];


const GATEWAYS = [
  { id: "momo" as const, name: "MoMo", color: "#a50064" },
  { id: "zalopay" as const, name: "ZaloPay", color: "#0068ff" },
];


const TX: Record<number, { label: string; credit: boolean }> = {
  1: { label: "Nạp tiền", credit: true },
  2: { label: "Thanh toán", credit: false },
  3: { label: "Hoàn tiền", credit: true },
  4: { label: "Thu nhập", credit: true },
  5: { label: "Rút tiền", credit: false },
  6: { label: "Bồi thường", credit: true },
};

export function CustomerWallet() {
  const goBack = useGoBack("customerProfile");
  const navigate = useGatedNavigate();
  const { data: wallet, loading } = useApi(() => walletApi.getMyWallet());

  const [amount, setAmount] = useState<number>(QUICK_AMOUNTS[0]);
  const [gateway, setGateway] = useState<"momo" | "zalopay">("momo");

  
  
  const handleTopUp = () => {
    if (amount <= 0) {
      notify.error("Vui lòng chọn hoặc nhập số tiền nạp.");
      return;
    }
    navigate("mockGateway", { mode: "topup", amount, provider: gateway });
  };

  const transactions = wallet?.recentTransactions ?? [];

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Ví của tôi" onBack={goBack} />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-5 text-white shadow-lg shadow-blue-200">
          <div className="flex items-center gap-2 text-blue-100 text-sm mb-1">
            <WalletIcon className="w-4 h-4" />
            Số dư khả dụng
          </div>
          <p className="text-3xl font-extrabold">
            {loading && !wallet ? "…" : `${formatVnd(wallet?.balance ?? 0)}đ`}
          </p>
        </div>

        {}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-bold text-foreground mb-3">Nạp tiền vào ví</h3>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {QUICK_AMOUNTS.map((a) => (
              <button
                key={a}
                onClick={() => setAmount(a)}
                className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors ${amount === a ? "border-blue-600 bg-accent text-blue-600" : "border-transparent bg-muted text-foreground"}`}
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

          {}
          <p className="text-xs font-semibold text-muted-foreground mb-2">Chọn cổng thanh toán</p>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {GATEWAYS.map((g) => {
              const active = gateway === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => setGateway(g.id)}
                  className={`py-2.5 rounded-xl text-sm font-bold border-2 transition-colors ${active ? "text-white" : "border-transparent bg-muted text-foreground"}`}
                  style={active ? { background: g.color, borderColor: g.color } : undefined}
                >
                  {g.name}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleTopUp}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <QrCode className="w-4 h-4" />
            {`Nạp ${formatVnd(amount)}đ qua ${GATEWAYS.find((g) => g.id === gateway)?.name}`}
          </button>
          <p className="text-[11px] text-muted-foreground mt-2">
            Bạn sẽ được chuyển tới cổng giả lập để quét mã QR và xác nhận thanh toán.
          </p>
        </div>

        {}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-bold text-foreground mb-3">Lịch sử giao dịch</h3>
          {loading && !wallet ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Chưa có giao dịch nào.</p>
          ) : (
            <div className="divide-y divide-border">
              {transactions.map((t) => {
                const meta = TX[t.type] ?? { label: "Giao dịch", credit: true };
                return (
                  <div key={t.transactionId} className="flex items-center gap-3 py-3">
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
                        {t.description || meta.label}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDateVn(t.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-bold ${meta.credit ? "text-green-600" : "text-red-600"}`}
                      >
                        {meta.credit ? "+" : "-"}
                        {formatVnd(Math.abs(t.amount))}đ
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Số dư: {formatVnd(t.balanceAfter)}đ
                      </p>
                    </div>
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
