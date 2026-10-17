import React from 'react';
import { RouterProvider, useRouter } from './context/RouterContext.js';
import { HotelProvider } from './context/HotelContext.js';
import { AdminAuthProvider } from './context/AdminAuthContext.js';

// Layout components
import { Navbar } from './components/layout/Navbar.js';
import { Footer } from './components/layout/Footer.js';
import { WhatsAppWidget } from './components/layout/WhatsAppWidget.js';

// Public Pages
import { HomePage } from './pages/HomePage.js';
import { AboutPage } from './pages/AboutPage.js';
import { RoomsPage } from './pages/RoomsPage.js';
import { RoomDetailPage } from './pages/RoomDetailPage.js';
import { AvailabilityPage } from './pages/AvailabilityPage.js';
import { BookingCheckoutPage } from './pages/BookingCheckoutPage.js';
import { BookingConfirmationPage } from './pages/BookingConfirmationPage.js';
import { BookingLookupPage } from './pages/BookingLookupPage.js';
import { GalleryPage } from './pages/GalleryPage.js';
import { ContactPage } from './pages/ContactPage.js';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage.js';
import { BookingTermsPage } from './pages/BookingTermsPage.js';
import { NotFoundPage } from './pages/NotFoundPage.js';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage.js';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage.js';
import { AdminBookingsPage } from './pages/admin/AdminBookingsPage.js';
import { AdminRoomsPage } from './pages/admin/AdminRoomsPage.js';
import { AdminRoomTypesPage } from './pages/admin/AdminRoomTypesPage.js';
import { AdminAvailabilityPage } from './pages/admin/AdminAvailabilityPage.js';
import { AdminGalleryPage } from './pages/admin/AdminGalleryPage.js';
import { AdminTestimonialsPage } from './pages/admin/AdminTestimonialsPage.js';
import { AdminContentPage } from './pages/admin/AdminContentPage.js';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage.js';

function AppContent() {
  const { pathname } = useRouter();

  // Normalize path by stripping trailing slash (except root '/')
  const cleanPath = pathname.length > 1 && pathname.endsWith('/') 
    ? pathname.slice(0, -1) 
    : pathname;

  // 1. ADMIN ROUTES
  if (cleanPath.startsWith('/admin')) {
    let adminComponent = <NotFoundPage />;

    if (cleanPath === '/admin' || cleanPath === '/admin/login') {
      adminComponent = <AdminLoginPage />;
    } else if (cleanPath === '/admin/dashboard') {
      adminComponent = <AdminDashboardPage />;
    } else if (cleanPath === '/admin/bookings') {
      adminComponent = <AdminBookingsPage />;
    } else if (cleanPath === '/admin/rooms') {
      adminComponent = <AdminRoomsPage />;
    } else if (cleanPath === '/admin/room-types') {
      adminComponent = <AdminRoomTypesPage />;
    } else if (cleanPath === '/admin/availability') {
      adminComponent = <AdminAvailabilityPage />;
    } else if (cleanPath === '/admin/gallery') {
      adminComponent = <AdminGalleryPage />;
    } else if (cleanPath === '/admin/testimonials') {
      adminComponent = <AdminTestimonialsPage />;
    } else if (cleanPath === '/admin/content') {
      adminComponent = <AdminContentPage />;
    } else if (cleanPath === '/admin/settings') {
      adminComponent = <AdminSettingsPage />;
    }

    return (
      <AdminAuthProvider>
        {adminComponent}
      </AdminAuthProvider>
    );
  }

  // 2. PUBLIC ROUTES
  let publicPage = <NotFoundPage />;

  if (cleanPath === '') {
    publicPage = <HomePage />;
  } else if (cleanPath === '/') {
    publicPage = <HomePage />;
  } else if (cleanPath === '/about') {
    publicPage = <AboutPage />;
  } else if (cleanPath === '/rooms') {
    publicPage = <RoomsPage />;
  } else if (cleanPath === '/rooms/standard') {
    publicPage = <RoomDetailPage slugOverride="standard" />;
  } else if (cleanPath === '/rooms/deluxe') {
    publicPage = <RoomDetailPage slugOverride="deluxe" />;
  } else if (cleanPath === '/rooms/executive') {
    publicPage = <RoomDetailPage slugOverride="executive" />;
  } else if (cleanPath === '/rooms/suite') {
    publicPage = <RoomDetailPage slugOverride="suite" />;
  } else if (cleanPath.startsWith('/rooms/')) {
    publicPage = <RoomDetailPage />;
  } else if (cleanPath === '/availability') {
    publicPage = <AvailabilityPage />;
  } else if (cleanPath === '/book') {
    publicPage = <BookingCheckoutPage />;
  } else if (cleanPath.startsWith('/booking/confirmation/')) {
    publicPage = <BookingConfirmationPage />;
  } else if (cleanPath === '/booking-lookup') {
    publicPage = <BookingLookupPage />;
  } else if (cleanPath === '/gallery') {
    publicPage = <GalleryPage />;
  } else if (cleanPath === '/contact') {
    publicPage = <ContactPage />;
  } else if (cleanPath === '/privacy') {
    publicPage = <PrivacyPolicyPage />;
  } else if (cleanPath === '/booking-terms') {
    publicPage = <BookingTermsPage />;
  } else if (cleanPath === '/404') {
    publicPage = <NotFoundPage />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {publicPage}
      </main>
      <WhatsAppWidget />
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <HotelProvider>
        <AppContent />
      </HotelProvider>
    </RouterProvider>
  );
}
