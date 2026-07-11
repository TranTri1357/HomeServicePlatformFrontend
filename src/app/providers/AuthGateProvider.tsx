import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, Lock, X } from "lucide-react";
import { useAuth } from "./AuthProvider";

interface AuthGateValue {
  /**
   * Cổng đăng nhập cấp hành động. Trả về true nếu đã đăng nhập (cứ tiếp tục);
   * nếu là khách vãng lai thì mở popup nhắc đăng nhập và trả về false.
   * @param intendedPath đường dẫn quay lại sau khi đăng nhập thành công.
   */
  requireAuth: (intendedPath?: string) => boolean;
}

const AuthGateContext = createContext<AuthGateValue | undefined>(undefined);

export function AuthGateProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [intended, setIntended] = useState<string | undefined>(undefined);

  const requireAuth = useCallback(
    (intendedPath?: string) => {
      if (isAuthenticated) return true;
      setIntended(intendedPath);
      setOpen(true);
      return false;
    },
    [isAuthenticated],
  );

  const goLogin = () => {
    setOpen(false);
    navigate("/auth", intended ? { state: { from: { pathname: intended } } } : undefined);
  };

  const value = useMemo<AuthGateValue>(() => ({ requireAuth }), [requireAuth]);

  return (
    <AuthGateContext.Provider value={value}>
      {children}

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="Đóng"
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Cần đăng nhập</h3>
            <p className="text-sm text-muted-foreground mt-1.5">
              Vui lòng đăng nhập để sử dụng chức năng này. Bạn vẫn có thể tự do tìm kiếm và xem
              dịch vụ, thợ mà không cần đăng nhập.
            </p>

            <div className="mt-5 flex flex-col gap-2">
              <button
                onClick={goLogin}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 transition-colors text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Đăng nhập / Đăng ký
              </button>
              <button
                onClick={() => setOpen(false)}
                className="w-full py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Để sau
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthGateContext.Provider>
  );
}

export function useAuthGate(): AuthGateValue {
  const value = useContext(AuthGateContext);
  if (!value) {
    throw new Error("useAuthGate must be used inside AuthGateProvider");
  }
  return value;
}
