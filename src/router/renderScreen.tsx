import type { Screen, CreateBookingInput } from "@/shared/types";

import { CustomerHome } from "@/pages/Customer";
import { CustomerProfile, ProviderProfile } from "@/pages/Profile";
import { ServiceList, ServiceDetail, ProviderServiceManagement } from "@/pages/Service";
import { TechnicianMap, TechnicianDetail } from "@/pages/Technician";
import { Booking, BookingManagement } from "@/pages/Booking";
import { Payment, MockGateway } from "@/pages/Payment";
import { Chat } from "@/pages/Chat";
import { Notifications } from "@/pages/Notification";
import { ProviderDashboard, ProviderJobSheet, ProviderJobManagement } from "@/pages/Provider";
import { ProviderSchedule } from "@/pages/Calendar";
import { ProviderAreaRouting } from "@/pages/Area";
import {
  AdminDashboard,
  AdminOrders,
  AdminProviders,
  AdminServices,
  AdminServiceTypes,
  AdminAccounts,
  AdminReviews,
  AdminCommissions,
  AdminComplaints,
} from "@/pages/Admin";

type NavigateFn = (s: Screen, data?: object) => void;

export function renderScreen(
  screen: Screen,
  screenData: object | undefined,
  navigate: NavigateFn,
): React.ReactNode {
  switch (screen) {
    case "customerHome":
      return <CustomerHome onNavigate={navigate} />;
    case "serviceList":
      return <ServiceList onNavigate={navigate} />;
    case "serviceDetail":
      return <ServiceDetail onNavigate={navigate} data={screenData as { serviceId?: number }} />;
    case "technicianMap":
      return <TechnicianMap onNavigate={navigate} data={screenData as { serviceId?: number }} />;
    case "technicianDetail":
      return (
        <TechnicianDetail onNavigate={navigate} data={screenData as { taskerId?: number }} />
      );
    case "booking":
      return <Booking onNavigate={navigate} data={screenData as { serviceId?: number }} />;
    case "payment":
      return (
        <Payment
          onNavigate={navigate}
          data={
            screenData as {
              draft?: CreateBookingInput;
              estimatedAmount?: number;
              bookingId?: number;
              finalAmount?: number;
            }
          }
        />
      );
    case "mockGateway":
      return (
        <MockGateway
          onNavigate={navigate}
          data={
            screenData as {
              paymentId?: number;
              bookingId?: number;
              amount?: number;
              provider?: "momo" | "zalopay";
            }
          }
        />
      );
    case "chat":
      return <Chat onNavigate={navigate} />;
    case "customerProfile":
      return <CustomerProfile onNavigate={navigate} />;
    case "bookingManagement":
      return <BookingManagement onNavigate={navigate} />;
    case "notifications":
      return <Notifications onNavigate={navigate} />;
    case "providerDashboard":
      return <ProviderDashboard onNavigate={navigate} />;
    case "providerJobSheet":
      return <ProviderJobSheet onNavigate={navigate} />;
    case "providerSchedule":
      return <ProviderSchedule onNavigate={navigate} />;
    case "providerChat":
      return <Chat onNavigate={(s) => navigate(s)} isProvider />;
    case "providerProfile":
      return <ProviderProfile onNavigate={navigate} />;
    case "providerJobManagement":
      return <ProviderJobManagement onNavigate={navigate} />;
    case "providerServiceManagement":
      return <ProviderServiceManagement onNavigate={navigate} />;
    case "providerAreaRouting":
      return <ProviderAreaRouting onNavigate={navigate} />;
    case "adminDashboard":
      return <AdminDashboard onNavigate={navigate} />;
    case "adminOrders":
      return <AdminOrders />;
    case "adminProviders":
      return <AdminProviders />;
    case "adminServices":
      return <AdminServices />;
    case "adminServiceTypes":
      return <AdminServiceTypes />;
    case "adminAccounts":
      return <AdminAccounts />;
    case "adminReviews":
      return <AdminReviews />;
    case "adminCommissions":
      return <AdminCommissions />;
    case "adminComplaints":
      return <AdminComplaints />;
    default:
      return <CustomerHome onNavigate={navigate} />;
  }
}
