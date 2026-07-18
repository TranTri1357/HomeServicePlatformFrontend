import { Suspense } from "react";
import type { Screen } from "@/shared/types";
import { taskerAddressApi } from "@/services/api";

import { CustomerHome } from "@/pages/Customer";
import { CustomerProfile, ProviderProfile } from "@/pages/Profile";
import { ServiceList, ServiceDetail, ProviderServiceManagement } from "@/pages/Service";
import { TechnicianDetail } from "@/pages/Technician";
import { TechnicianMap, ScreenFallback } from "./lazyScreens";
import { Booking, BookingManagement } from "@/pages/Booking";
import { EmergencyBooking } from "@/pages/Emergency";
import { Payment, MockGateway } from "@/pages/Payment";
import { CustomerWallet } from "@/pages/Wallet";
import { CustomerAddresses } from "@/pages/Address";
import { Chat } from "@/pages/Chat";
import { Notifications } from "@/pages/Notification";
import {
  ProviderDashboard,
  ProviderJobSheet,
  ProviderJobManagement,
  ProviderIncome,
} from "@/pages/Provider";
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
      return <ServiceList onNavigate={navigate} data={screenData as { categoryId?: number }} />;
    case "serviceDetail":
      return <ServiceDetail onNavigate={navigate} data={screenData as { serviceId?: number }} />;
    case "technicianMap":
      return (
        <Suspense fallback={<ScreenFallback />}>
          <TechnicianMap onNavigate={navigate} data={screenData as { serviceId?: number }} />
        </Suspense>
      );
    case "technicianDetail":
      return (
        <TechnicianDetail onNavigate={navigate} data={screenData as { taskerId?: number }} />
      );
    case "booking":
      return <Booking onNavigate={navigate} data={screenData as { serviceId?: number }} />;
    case "emergencyBooking":
      return <EmergencyBooking onNavigate={navigate} />;
    case "payment":
      return (
        <Payment
          onNavigate={navigate}
          data={
            screenData as {
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
              mode?: "booking" | "topup";
              paymentId?: number;
              bookingId?: number;
              amount?: number;
              provider?: "momo" | "zalopay";
            }
          }
        />
      );
    case "chat":
      return <Chat onNavigate={navigate} data={screenData as { bookingId?: number }} />;
    case "customerProfile":
      return <CustomerProfile onNavigate={navigate} />;
    case "customerWallet":
      return <CustomerWallet />;
    case "customerAddresses":
      return <CustomerAddresses />;
    case "providerAddresses":
      return (
        <CustomerAddresses
          api={taskerAddressApi}
          backScreen="providerProfile"
          title="Địa chỉ hoạt động"
        />
      );
    case "bookingManagement":
      return <BookingManagement onNavigate={navigate} />;
    case "notifications":
      return <Notifications />;
    case "providerDashboard":
      return <ProviderDashboard onNavigate={navigate} />;
    case "providerJobSheet":
      return <ProviderJobSheet onNavigate={navigate} />;
    case "providerSchedule":
      return <ProviderSchedule />;
    case "providerChat":
      return (
        <Chat
          onNavigate={navigate}
          isProvider
          data={screenData as { bookingId?: number }}
        />
      );
    case "providerProfile":
      return <ProviderProfile onNavigate={navigate} />;
    case "providerNotifications":
      return <Notifications variant="provider" />;
    case "providerJobManagement":
      return <ProviderJobManagement onNavigate={navigate} />;
    case "providerIncome":
      return <ProviderIncome onNavigate={navigate} />;
    case "providerServiceManagement":
      return <ProviderServiceManagement />;
    case "providerAreaRouting":
      return <ProviderAreaRouting />;
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
