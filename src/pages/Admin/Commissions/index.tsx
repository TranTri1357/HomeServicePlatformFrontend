import { useState } from "react";
import { Edit3, CheckCircle } from "lucide-react";
import { adminCommissionData } from "@/services/Admin/commission.data";

export function Commissions() {
  const [items, setItems] = useState(adminCommissionData);
  const [editId, setEditId] = useState<number | null>(null);
  const [editRate, setEditRate] = useState(0);
  const [saveMsg, setSaveMsg] = useState(false);
  const [globalRate, setGlobalRate] = useState(15);

  const handleEdit = (id: number, rate: number) => {
    setEditId(id);
    setEditRate(rate);
  };
  const handleSave = () => {
    if (editId !== null)
      setItems(
        items.map((i) =>
          i.id === editId ? { ...i, rate: editRate } : i,
        ),
      );
    setEditId(null);
    setSaveMsg(true);
    setTimeout(() => setSaveMsg(false), 2500);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Quản lý hoa hồng
        </h1>
        <p className="text-sm text-muted-foreground">
          Thiết lập tỷ lệ hoa hồng theo từng loại dịch vụ
        </p>
      </div>

      {saveMsg && (
        <div className="bg-green-500 text-white px-4 py-3 rounded-2xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-semibold">
            Đã lưu cài đặt hoa hồng!
          </span>
        </div>
      )}

      {/* Global rate */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="font-bold text-foreground mb-1">
          Tỷ lệ hoa hồng mặc định toàn hệ thống
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          Áp dụng khi không có cài đặt riêng cho từng danh mục
        </p>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <input
              type="range"
              min={5}
              max={30}
              value={globalRate}
              onChange={(e) =>
                setGlobalRate(Number(e.target.value))
              }
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>5%</span>
              <span>15%</span>
              <span>30%</span>
            </div>
          </div>
          <div className="w-20 text-center">
            <span className="text-3xl font-extrabold text-blue-600">
              {globalRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Per-category table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-foreground">
            Cài đặt theo loại dịch vụ
          </h3>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Lưu tất cả
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/40">
              <tr>
                {[
                  "Loại dịch vụ",
                  "Tỷ lệ hoa hồng (%)",
                  "Phí tối thiểu",
                  "Phí tối đa",
                  "Doanh thu HH/tháng",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left text-xs font-bold text-muted-foreground px-4 py-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="font-semibold text-sm text-foreground">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {editId === item.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          max={50}
                          value={editRate}
                          onChange={(e) =>
                            setEditRate(Number(e.target.value))
                          }
                          className="w-20 bg-muted border border-blue-400 px-2 py-1 rounded-lg text-sm focus:outline-none"
                        />
                        <span className="text-muted-foreground text-sm">
                          %
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{
                              width: `${(item.rate / 30) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-bold text-blue-600">
                          {item.rate}%
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {item.minFee}đ
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {item.maxFee}đ
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-green-600">
                    {item.monthlyRevenue}đ
                  </td>
                  <td className="px-4 py-3">
                    {editId === item.id ? (
                      <button
                        onClick={handleSave}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors"
                      >
                        Lưu
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          handleEdit(item.id, item.rate)
                        }
                        className="px-3 py-1 bg-muted hover:bg-accent rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        Sửa
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
