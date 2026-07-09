import { useState } from "react";
import { Wrench, Eye, EyeOff, Shield } from "lucide-react";
import type { UserMode } from "@/shared/types";
import { authApi } from "@/services/api";

export function AuthScreen({
  onLogin,
}: {
  onLogin: (mode: UserMode) => void;
}) {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      if (tab === "login") {
        if (!identifier || !password) {
          throw new Error("Vui lòng nhập đầy đủ thông tin");
        }
        
        // Mock fallback mode switch for UI flow without actual backend yet
        // In real app: const res = await authApi.login({ identifier, password });
        // onLogin(res.user.role);
        
        // Simulate network delay
        await new Promise(r => setTimeout(r, 800));
        
        // Temporary mock logic
        if (identifier.includes("admin")) onLogin("admin");
        else if (identifier.includes("tho")) onLogin("provider");
        else onLogin("customer");

      } else {
        if (!fullName || !phone || !email || !password || !confirmPassword) {
          throw new Error("Vui lòng nhập đầy đủ thông tin");
        }
        if (password !== confirmPassword) {
          throw new Error("Mật khẩu xác nhận không khớp");
        }
        
        // In real app: const res = await authApi.register({ fullName, phone, email, password, role: "customer" });
        // onLogin(res.user.role);
        
        await new Promise(r => setTimeout(r, 800));
        onLogin("customer");
      }
    } catch (err: any) {
      setError(err.message || "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Wrench className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-white">FixNow</h1>
          <p className="text-blue-200 mt-1 text-sm">Dịch vụ nhà, chỉ một chạm</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-border">
            {(["login", "register"] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  setError(null);
                }}
                className={`flex-1 py-4 text-sm font-semibold transition-colors ${tab === t ? "text-blue-600 border-b-2 border-blue-600 bg-accent" : "text-muted-foreground"}`}
              >
                {t === "login" ? "Đăng nhập" : "Đăng ký"}
              </button>
            ))}
          </div>

          <div className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                {error}
              </div>
            )}

            {tab === "register" && (
              <div className="space-y-1">
                <label className="text-sm font-semibold text-foreground">Họ và tên</label>
                <input
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 rounded-xl text-sm border border-transparent focus:border-blue-600 focus:bg-white focus:outline-none transition-colors"
                  placeholder="Nguyễn Văn A"
                />
              </div>
            )}

            {tab === "register" ? (
              <>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-foreground">Số điện thoại</label>
                  <input
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl text-sm border border-transparent focus:border-blue-600 focus:bg-white focus:outline-none transition-colors"
                    placeholder="0901 234 567"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-foreground">Email</label>
                  <input
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl text-sm border border-transparent focus:border-blue-600 focus:bg-white focus:outline-none transition-colors"
                    placeholder="email@example.com"
                  />
                </div>
              </>
            ) : (
              <div className="space-y-1">
                <label className="text-sm font-semibold text-foreground">Email hoặc Số điện thoại</label>
                <input
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 rounded-xl text-sm border border-transparent focus:border-blue-600 focus:bg-white focus:outline-none transition-colors"
                  placeholder="Nhập 'admin' hoặc 'tho' để test quyền"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-semibold text-foreground">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 rounded-xl text-sm border border-transparent focus:border-blue-600 focus:bg-white focus:outline-none transition-colors pr-12"
                  placeholder="••••••••"
                />
                <button
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {tab === "register" && (
              <div className="space-y-1">
                <label className="text-sm font-semibold text-foreground">Xác nhận mật khẩu</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 rounded-xl text-sm border border-transparent focus:border-blue-600 focus:bg-white focus:outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
            )}

            <button
              disabled={loading}
              onClick={handleSubmit}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-blue-200 active:scale-[0.98] flex justify-center items-center"
            >
              {loading ? "Đang xử lý..." : tab === "login" ? "Đăng nhập" : "Tạo tài khoản"}
            </button>

            {tab === "login" && (
              <p className="text-center text-xs text-muted-foreground">
                Quên mật khẩu? <span className="text-blue-600 font-semibold cursor-pointer hover:underline">Khôi phục ngay</span>
              </p>
            )}

            <div className="relative flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">hoặc</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {["Google", "Facebook"].map((p) => (
                <button
                  key={p}
                  className="flex items-center justify-center gap-2 py-3 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  <span>{p === "Google" ? "🇬" : "🇫"}</span>
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-blue-200 text-xs mt-6">
          Bằng cách tiếp tục, bạn đồng ý với <span className="text-white font-medium cursor-pointer">Điều khoản dịch vụ</span>
        </p>

        {/* Admin portal link */}
        <div className="text-center mt-4">
          <button
            onClick={() => onLogin("admin")}
            className="flex items-center gap-2 mx-auto text-blue-200 hover:text-white text-xs font-medium transition-colors px-4 py-2 border border-white/20 rounded-xl hover:border-white/40 hover:bg-white/10"
          >
            <Shield className="w-3.5 h-3.5" />
            Truy cập Admin Portal
          </button>
        </div>
      </div>
    </div>
  );
}
