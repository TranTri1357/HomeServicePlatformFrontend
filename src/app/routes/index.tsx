import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "../App";
import { AuthLayout } from "./AuthLayout";
import { CustomerLayout } from "./CustomerLayout";
import { ProviderLayout } from "./ProviderLayout";
import { AdminLayout as AdminRouteLayout } from "./AdminLayout";
import { RouteScreen } from "./RouteScreen";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root shell */}
        <Route path="/" element={<App />}>
          <Route index element={<Navigate to="/auth" replace />} />
          <Route path="auth" element={<AuthLayout />} />
        </Route>

        {/* Customer */}
        <Route path="/customer" element={<CustomerLayout />}>
          <Route index element={<RouteScreen screen="customerHome" />} />
          <Route path="home" element={<RouteScreen screen="customerHome" />} />
          <Route path="services" element={<RouteScreen screen="serviceList" />} />
          <Route path="service/detail" element={<RouteScreen screen="serviceDetail" />} />
          <Route path="technicians" element={<RouteScreen screen="technicianMap" />} />
          <Route path="technician/detail" element={<RouteScreen screen="technicianDetail" />} />
          <Route path="booking" element={<RouteScreen screen="booking" />} />
          <Route path="payment" element={<RouteScreen screen="payment" />} />
          <Route path="chat" element={<RouteScreen screen="chat" />} />
          <Route path="profile" element={<RouteScreen screen="customerProfile" />} />
          <Route path="bookings" element={<RouteScreen screen="bookingManagement" />} />
          <Route path="notifications" element={<RouteScreen screen="notifications" />} />
        </Route>

        {/* Provider */}
        <Route path="/provider" element={<ProviderLayout />}>
          <Route index element={<RouteScreen screen="providerDashboard" />} />
          <Route path="dashboard" element={<RouteScreen screen="providerDashboard" />} />
          <Route path="job/detail" element={<RouteScreen screen="providerJobSheet" />} />
          <Route path="schedule" element={<RouteScreen screen="providerSchedule" />} />
          <Route path="jobs" element={<RouteScreen screen="providerJobManagement" />} />
          <Route path="services" element={<RouteScreen screen="providerServiceManagement" />} />
          <Route path="area" element={<RouteScreen screen="providerAreaRouting" />} />
          <Route path="profile" element={<RouteScreen screen="providerProfile" />} />
          <Route path="chat" element={<RouteScreen screen="providerChat" />} />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={<AdminRouteLayout />}>
          <Route index element={<RouteScreen screen="adminDashboard" />} />
          <Route path="dashboard" element={<RouteScreen screen="adminDashboard" />} />
          <Route path="orders" element={<RouteScreen screen="adminOrders" />} />
          <Route path="providers" element={<RouteScreen screen="adminProviders" />} />
          <Route path="services" element={<RouteScreen screen="adminServices" />} />
          <Route path="service-types" element={<RouteScreen screen="adminServiceTypes" />} />
          <Route path="accounts" element={<RouteScreen screen="adminAccounts" />} />
          <Route path="reviews" element={<RouteScreen screen="adminReviews" />} />
          <Route path="commissions" element={<RouteScreen screen="adminCommissions" />} />
          <Route path="complaints" element={<RouteScreen screen="adminComplaints" />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
