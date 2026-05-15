"use client";

/**
 * VIEW DISPATCHER (SPA Index REFINED V165)
 * SOP: Pendaftaran Berita Developer, Admin News, dan Donasi ke pangkalan utama.
 */

import { useView } from "@/context/view-context";
import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";

// FLAT VIEW REGISTRY
const DashboardHomePage = lazy(() => import("./home-view"));
const OrdersPage = lazy(() => import("./orders-view"));
const CommunityPage = lazy(() => import("./community-view"));
const EditProfilePage = lazy(() => import("./edit-profile-view"));
const PublicProfilePage = lazy(() => import("./profile-public-view"));
const ShopListPage = lazy(() => import("./shop-list-view"));
const MarketplaceCatalogPage = lazy(() => import("./marketplace-catalog-view"));
const CouriersPage = lazy(() => import("./couriers-view"));
const MemberRankingsPage = lazy(() => import("./rankings-view"));
const InfoSopPage = lazy(() => import("./info-view"));
const JoinPartnerPage = lazy(() => import("./join-view"));
const NotificationsPage = lazy(() => import("./notifications-view"));
const TestimonialsPage = lazy(() => import("./testimonials-view"));
const NewsView = lazy(() => import("./news-view"));
const DonationView = lazy(() => import("./donation-view"));

// Panel Admin (SPA)
const AdminDashboardPage = lazy(() => import("./admin-stats-view"));
const UserManagementPage = lazy(() => import("./admin-user-mgmt-view"));
const AdminOrderMonitoringPage = lazy(() => import("./admin-orders-view"));
const AdminAppsPage = lazy(() => import("./admin-apps-view"));
const AdminComplaintsPage = lazy(() => import("./admin-complaints-view"));
const AdminComplaintDetailPage = lazy(() => import("./admin-complaint-detail-view"));
const AdminTestimonialsPage = lazy(() => import("./admin-testimonials-view"));
const AdminModerationPage = lazy(() => import("./admin-moderation-view"));
const AdminMessageMgmtView = lazy(() => import("./admin-message-mgmt-view"));
const AdminInfoSettingsView = lazy(() => import("./admin-info-settings-view"));
const AdminAutoNotifView = lazy(() => import("./admin-auto-notif-view"));
const AdminNewsView = lazy(() => import("./admin-news-view"));

// Panel UMKM (SPA)
const UMKMLedgerPage = lazy(() => import("./umkm/ledger-view"));
const UMKMProductsPage = lazy(() => import("./umkm/products-view"));
const UMKMOrdersPage = lazy(() => import("./umkm/orders-view"));
const UMKMShopSettingsPage = lazy(() => import("./umkm/settings-view"));

// Courier & Dynamic View
const OrderDetailPage = lazy(() => import("./order-detail-view"));
const OrderNewPage = lazy(() => import("./order-new-view"));
const OrderChatPage = lazy(() => import("./order-chat-view"));
const ShopDetailPage = lazy(() => import("./shop-detail-view"));
const CourierPriceInputPage = lazy(() => import("./courier-price-input-view"));
const MemberComplaintPage = lazy(() => import("./member-complaint-view"));
const MemberComplaintsListPage = lazy(() => import("./member-complaints-list-view"));
const CourierDashboardPage = lazy(() => import("./courier-dashboard-view"));
const CourierHistoryPage = lazy(() => import("./courier-history-view"));
const CourierReportsPage = lazy(() => import("./courier-reports-view"));
const CourierUnpaidOrdersPage = lazy(() => import("./courier-unpaid-view"));

const MessagesCenterView = lazy(() => import("./messages-center-view"));
const ChatView = lazy(() => import("./chat-view"));

export default function DashboardSPA() {
  const { currentView } = useView();

  const renderView = () => {
    switch (currentView) {
      case 'home': return <DashboardHomePage />;
      case 'news': return <NewsView />;
      case 'donation': return <DonationView />;
      case 'orders': return <OrdersPage />;
      case 'community': return <CommunityPage />;
      case 'edit_profile_user': return <EditProfilePage />;
      case 'profile_user': return <PublicProfilePage />;
      case 'shop': return <ShopListPage />;
      case 'marketplace_catalog': return <MarketplaceCatalogPage />;
      case 'couriers': return <CouriersPage />;
      case 'rankings': return <MemberRankingsPage />;
      case 'info': return <InfoSopPage />;
      case 'join': return <JoinPartnerPage />;
      case 'notifications': return <NotificationsPage />;
      case 'testimonials': return <TestimonialsPage />;
      case 'order_detail': return <OrderDetailPage />;
      case 'order_new': return <OrderNewPage />;
      case 'order_chat': return <OrderChatPage />;
      case 'shop_detail': return <ShopDetailPage />;
      case 'courier_price_input': return <CourierPriceInputPage />;
      case 'member_complaint_detail': return <MemberComplaintPage />;
      case 'member_complaints': return <MemberComplaintsListPage />;
      case 'admin_stats': return <AdminDashboardPage />;
      case 'admin_users': return <UserManagementPage />;
      case 'admin_orders': return <AdminOrderMonitoringPage />;
      case 'admin_apps': return <AdminAppsPage />;
      case 'admin_complaints': return <AdminComplaintsPage />;
      case 'admin_complaint_detail': return <AdminComplaintDetailPage />;
      case 'admin_testimonials': return <AdminTestimonialsPage />;
      case 'admin_moderation': return <AdminModerationPage />;
      case 'admin_messages': return <AdminMessageMgmtView />;
      case 'admin_info_settings': return <AdminInfoSettingsView />;
      case 'admin_auto_notif': return <AdminAutoNotifView />;
      case 'admin_news': return <AdminNewsView />;
      case 'umkm_ledger': return <UMKMLedgerPage />;
      case 'umkm_products': return <UMKMProductsPage />;
      case 'umkm_orders': return <UMKMOrdersPage />;
      case 'umkm_settings': return <UMKMShopSettingsPage />;
      case 'courier_dashboard': return <CourierDashboardPage />;
      case 'courier_history': return <CourierHistoryPage />;
      case 'courier_reports': return <CourierReportsPage />;
      case 'courier_unpaid': return <CourierUnpaidOrdersPage />;
      case 'messages_center':
      case 'messages': return <MessagesCenterView />;
      case 'chat_view': return <ChatView />;
      default: return <DashboardHomePage />;
    }
  };

  return (
    <div className="h-full w-full bg-[#F8FAFC]">
      <Suspense fallback={<div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] space-y-4"><Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" /><p className="text-[10px] font-black uppercase tracking-widest animate-pulse">Memuat...</p></div>}>
        <div className="animate-in fade-in duration-500 h-full w-full">{renderView()}</div>
      </Suspense>
    </div>
  );
}
