import { Outlet } from "react-router-dom";
import { AuthGateProvider } from "./providers";

export default function App() {
  return (
    <div className="w-full h-full" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* AuthGateProvider lives inside the router so its login prompt can navigate. */}
      <AuthGateProvider>
        <Outlet />
      </AuthGateProvider>
    </div>
  );
}
