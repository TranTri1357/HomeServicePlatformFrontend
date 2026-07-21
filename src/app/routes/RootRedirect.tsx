import { Navigate } from "react-router-dom";
import { useAuth } from "@/app/providers";


export function RootRedirect() {
  const { isAuthenticated, getHomePath } = useAuth();
  return <Navigate to={isAuthenticated ? getHomePath() : "/customer/home"} replace />;
}
