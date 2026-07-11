import { useState, type FormEvent } from "react";
import { Wrench, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { authApi } from "@/services/api";
import type { LoginResult } from "@/services/api/auth.api";
import { parseApiErrors, type FieldErrors, type FieldKey } from "@/services/api/authErrors";

function inputClass(hasError: boolean) {
  return [
    "w-full px-4 py-3 bg-slate-50 rounded-xl text-sm transition-colors focus:outline-none",
    hasError
      ? "border border-red-500 focus:border-red-500 focus:bg-white"
      : "border border-transparent focus:border-blue-600 focus:bg-white",
  ].join(" ");
}

export function AuthScreen({
  onLogin,
  onBack,
}: {
  onLogin: (result: LoginResult) => void;
  /** Quay lại trang duyệt công khai (khách vãng lai). */
  onBack?: () => void;
}) {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // roleId: 2 = Customer, 3 = Provider
  const [roleId, setRoleId] = useState<2 | 3>(2);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const clearFieldError = (key: FieldKey) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setGeneralError(null);
    setFieldErrors({});
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (tab === "login") {
        const localErrors: FieldErrors = {};
        if (!identifier) localErrors.identifier = "Vui lòng nhập email hoặc số điện thoại";
        if (!password) localErrors.password = "Vui lòng nhập mật khẩu";
        if (Object.keys(localErrors).length > 0) {
          setFieldErrors(localErrors);
          return;
        }

        const res = await authApi.login({ identifier, password });
        onLogin(res);
        return;
      }

      const localErrors: FieldErrors = {};
      if (!fullName) localErrors.fullName = "Họ và tên không được để trống";
      if (!phone) localErrors.phone = "Số điện thoại không được để trống";
      if (!email) localErrors.email = "Email không được để trống";
      if (!password) localErrors.password = "Mật khẩu không được để trống";
      if (!confirmPassword) localErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
      if (password && confirmPassword && password !== confirmPassword) {
        localErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
      }

      if (Object.keys(localErrors).length > 0) {
        setFieldErrors(localErrors);
        return;
      }

      const result = await authApi.register({
        roleId,
        fullName,
        email,
        phone,
        password,
        confirmPassword,
      });

      setSuccessMessage(result.message || "Đăng ký tài khoản thành công");
      setIdentifier(email);
      setPassword("");
      setConfirmPassword("");

      // Auto switch to Login tab after successful register.
      window.setTimeout(() => {
        setTab("login");
        setSuccessMessage("Đăng ký thành công. Vui lòng đăng nhập.");
        setFieldErrors({});
        setGeneralError(null);
      }, 1200);
    } catch (err) {
      const parsed = parseApiErrors(err);
      setFieldErrors(parsed.fieldErrors);
      setGeneralError(parsed.generalError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mb-4 flex items-center gap-1.5 text-blue-100 hover:text-white text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Về trang chủ
          </button>
        )}

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
                type="button"
                key={t}
                onClick={() => {
                  setTab(t);
                  setGeneralError(null);
                  setFieldErrors({});
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-4 text-sm font-semibold transition-colors ${tab === t ? "text-blue-600 border-b-2 border-blue-600 bg-accent" : "text-muted-foreground"}`}
              >
                {t === "login" ? "Đăng nhập" : "Đăng ký"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} autoComplete="off" className="p-6 space-y-4" noValidate>
            {/* Banner chỉ dùng cho lỗi hệ thống / lỗi không gắn field */}
            {generalError && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                {generalError}
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-green-50 text-green-700 text-sm rounded-xl border border-green-100">
                {successMessage}
              </div>
            )}

            {tab === "register" && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Vai trò</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setRoleId(2);
                      clearFieldError("roleId");
                    }}
                    className={`py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                      roleId === 2
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-white"
                    }`}
                  >
                    Khách hàng
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRoleId(3);
                      clearFieldError("roleId");
                    }}
                    className={`py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                      roleId === 3
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-white"
                    }`}
                  >
                    Thợ (Đối tác)
                  </button>
                </div>
                {fieldErrors.roleId && (
                  <p className="text-sm text-red-500 mt-1">{fieldErrors.roleId}</p>
                )}
              </div>
            )}

            {tab === "register" && (
              <div className="space-y-1">
                <label className="text-sm font-semibold text-foreground">Họ và tên</label>
                <input
                  name="fullName"
                  autoComplete="off"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    clearFieldError("fullName");
                  }}
                  className={inputClass(Boolean(fieldErrors.fullName))}
                  placeholder="Nguyễn Văn A"
                />
                {fieldErrors.fullName && (
                  <p className="text-sm text-red-500 mt-1">{fieldErrors.fullName}</p>
                )}
              </div>
            )}

            {tab === "register" ? (
              <>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-foreground">Số điện thoại</label>
                  <input
                    name="phone"
                    autoComplete="off"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      clearFieldError("phone");
                    }}
                    className={inputClass(Boolean(fieldErrors.phone))}
                    placeholder="0901 234 567"
                  />
                  {fieldErrors.phone && (
                    <p className="text-sm text-red-500 mt-1">{fieldErrors.phone}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-foreground">Email</label>
                  <input
                    name="email"
                    type="email"
                    autoComplete="off"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearFieldError("email");
                    }}
                    className={inputClass(Boolean(fieldErrors.email))}
                    placeholder="email@example.com"
                  />
                  {fieldErrors.email && (
                    <p className="text-sm text-red-500 mt-1">{fieldErrors.email}</p>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-1">
                <label className="text-sm font-semibold text-foreground">
                  Email hoặc Số điện thoại
                </label>
                <input
                  name="identifier"
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    clearFieldError("identifier");
                  }}
                  className={inputClass(Boolean(fieldErrors.identifier))}
                  placeholder="string@gmail.com"
                />
                {fieldErrors.identifier && (
                  <p className="text-sm text-red-500 mt-1">{fieldErrors.identifier}</p>
                )}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-semibold text-foreground">Mật khẩu</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPass ? "text" : "password"}
                  autoComplete={tab === "login" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearFieldError("password");
                  }}
                  className={`${inputClass(Boolean(fieldErrors.password))} pr-12`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-sm text-red-500 mt-1">{fieldErrors.password}</p>
              )}
            </div>

            {tab === "register" && (
              <div className="space-y-1">
                <label className="text-sm font-semibold text-foreground">Xác nhận mật khẩu</label>
                <input
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    clearFieldError("confirmPassword");
                  }}
                  className={inputClass(Boolean(fieldErrors.confirmPassword))}
                  placeholder="••••••••"
                />
                {fieldErrors.confirmPassword && (
                  <p className="text-sm text-red-500 mt-1">{fieldErrors.confirmPassword}</p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-blue-200 active:scale-[0.98] flex justify-center items-center"
            >
              {loading ? "Đang xử lý..." : tab === "login" ? "Đăng nhập" : "Tạo tài khoản"}
            </button>

            {tab === "login" && (
              <p className="text-center text-xs text-muted-foreground">
                Quên mật khẩu?{" "}
                <span className="text-blue-600 font-semibold cursor-pointer hover:underline">
                  Khôi phục ngay
                </span>
              </p>
            )}
          </form>
        </div>

        <p className="text-center text-blue-200 text-xs mt-6">
          Bằng cách tiếp tục, bạn đồng ý với{" "}
          <span className="text-white font-medium cursor-pointer">Điều khoản dịch vụ</span>
        </p>
      </div>
    </div>
  );
}
