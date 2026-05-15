
"use client";

/**
 * VIEW DISPATCHER (Mahakarya SPA Index V130)
 * SOP: Eliminasi Splash Screen redundan.
 * FIX: Pemuatan internal kini hanya menggunakan sinyal transparan ringan.
 */

import { useView } from "@/context/view-context";
import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";

// FLAT VIEW REGISTRY
const HomeView = lazy(() => import("./dashboard/home-view"));
const MessagesCenterView = lazy(() => import("./dashboard/messages-center-view"));
const ChatView = lazy(() => import("./dashboard/chat-view"));
const CourierListView = lazy(() => import("./dashboard/couriers-view"));
const ShopListView = lazy(() => import("./dashboard/shop-list-view"));
const RankingsView = lazy(() => import("./dashboard/rankings-view"));
const InfoSopView = lazy(() => import("./dashboard/info-view"));
const NotificationsView = lazy(() => import("./dashboard/notifications-view"));
const OrdersView = lazy(() => import("./dashboard/orders-view"));
const CommunityView = lazy(() => import("./dashboard/community-view"));
const TestimonialsView = lazy(() => import("./dashboard/testimonials-view"));

// Panel Admin (Flat)
const AdminDashboardView = lazy(() => import("./dashboard/admin-stats-view"));
const AdminUserMgmtView = lazy(() => import("./dashboard/admin-user-mgmt-view"));
const AdminOrdersView = lazy(() => import("./dashboard/admin-orders-view"));
const AdminAppsView = lazy(() => import("./dashboard/admin-apps-view"));
const AdminComplaintsView = lazy(() => import("./dashboard/admin-complaints-view"));
const AdminComplaintDetailView = lazy(() => import("./dashboard/admin-complaint-detail-view"));
const AdminTestimonialsView = lazy(() => import("./dashboard/admin-testimonials-view"));
const AdminModerationView = lazy(() => import("./dashboard/admin-moderation-view"));
const AdminMessageMgmtView = lazy(() => import("./dashboard/admin-message-mgmt-view"));
const AdminInfoSettingsView = lazy(() => import("./dashboard/admin-info-settings-view"));
const AdminAutoNotifView = lazy(() => import("./dashboard/admin-auto-notif-view"));
const AdminNewsView = lazy(() => import("./dashboard/admin-news-view"));

// Panel UMKM (Flat)
const UMKMLedgerView = lazy(() => import("./dashboard/umkm/ledger-view"));
const UMKMProductsView = lazy(() => import("./dashboard/umkm/products-view"));
const UMKMOrdersView = lazy(() => import("./dashboard/umkm/orders-view"));
const UMKMShopSettingsView = lazy(() => import("./dashboard/umkm/settings-view"));

// Courier & Dynamic View
const OrderDetailPage = lazy(() => import("./dashboard/order-detail-view"));
const OrderNewPage = lazy(() => import("./dashboard/order-new-view"));
const OrderChatPage = lazy(() => import("./dashboard/order-chat-view"));
const ShopDetailPage = lazy(() => import("./dashboard/shop-detail-view"));
const CourierPriceInputPage = lazy(() => import("./dashboard/courier-price-input-view"));
const MemberComplaintDetailPage = lazy(() => import("./dashboard/member-complaint-view"));
const MemberComplaintsListPage = lazy(() => import("./dashboard/member-complaints-list-view"));
const PublicProfilePage = lazy(() => import("./dashboard/profile-public-view"));
const EditProfilePage = lazy(() => import("./dashboard/edit-profile-view"));
const JoinPartnerPage = lazy(() => import("./dashboard/join-view"));

export default function DashboardSPA() {
  const { currentView, isInitialized } = useView();

  if (!isInitialized) return <LoadingSpinner />;

  const renderView = () => {
    switch (currentView) {
      case 'home': return <HomeView />;
      case 'messages_center':
      case 'messages': return <MessagesCenterView />; 
      case 'chat_view': return <ChatView />;
      case 'couriers': return <CourierListView />;
      case 'shop': return <ShopListView />;
      case 'rankings': return <RankingsView />;
      case 'info': return <InfoSopView />;
      case 'notifications': return <NotificationsView />;
      case 'orders': return <OrdersView />;
      case 'community': return <CommunityView />;
      case 'testimonials': return <TestimonialsView />;
      case 'edit_profile_user': return <EditProfilePage />;
      case 'profile_user': return <PublicProfilePage />;
      case 'join': return <JoinPartnerPage />;
      
      case 'order_detail': return <OrderDetailPage />;
      case 'order_new': return <OrderNewPage />;
      case 'order_chat': return <OrderChatPage />;
      case 'shop_detail': return <ShopDetailPage />;
      case 'courier_price_input': return <CourierPriceInputPage />;
      case 'member_complaint_detail': return <MemberComplaintDetailPage />;
      case 'member_complaints': return <MemberComplaintsListPage />;

      case 'admin_stats': return <AdminDashboardView />;
      case 'admin_users': return <AdminUserMgmtView />;
      case 'admin_messages': return <AdminMessageMgmtView />;
      case 'admin_orders': return <AdminOrdersView />;
      case 'admin_apps': return <AdminAppsView />;
      case 'admin_complaints': return <AdminComplaintsView />;
      case 'admin_complaint_detail': return <AdminComplaintDetailView />;
      case 'admin_testimonials': return <AdminTestimonialsView />;
      case 'admin_moderation': return <AdminModerationView />;
      case 'admin_info_settings': return <AdminInfoSettingsView />;
      case 'admin_auto_notif': return <AdminAutoNotifView />;
      case 'admin_news': return <AdminNewsView />;

      case 'umkm_ledger': return <UMKMLedgerView />;
      case 'umkm_products': return <UMKMProductsView />;
      case 'umkm_orders': return <UMKMOrdersView />;
      case 'umkm_settings': return <UMKMShopSettingsView />;

      case 'courier_dashboard': return <CourierDashboardView />;
      case 'courier_history': return <CourierHistoryView />;
      case 'courier_reports': return <CourierReportsView />;
      case 'courier_unpaid': return <CourierUnpaidView />;

      default: return <HomeView />;
    }
  };

  return (
    <div className="h-full w-full relative overflow-hidden flex flex-col bg-[#F8FAFC]">
      <Suspense fallback={<LoadingSpinner />}>
         <div className="animate-in fade-in duration-500 h-full w-full">{renderView()}</div>
      </Suspense>
    </div>
  );
}

/**
 * COMPONENT: LoadingSpinner (MINIMALIST V130)
 */
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-full bg-[#F8FAFC]">
       <Loader2 className="h-6 w-6 animate-spin text-primary opacity-10" />
    </div>
  );
}
