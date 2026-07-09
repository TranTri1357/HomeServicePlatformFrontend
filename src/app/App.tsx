import { Outlet } from "react-router-dom";

export default function App() {
  return (
    <div className="w-full h-full" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Outlet />
    </div>
  );
}
