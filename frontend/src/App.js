import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider } from './core/context/AuthContext';
import Navbar from './shared/components/Navbar';
import ProtectedRoute from './shared/components/ProtectedRoute';
import AdminLayout from './features/admin/components/AdminLayout';
import ScrollToTop from './shared/components/ScrollToTop';

// Customer Pages
import LandingPage from './features/landing/pages/LandingPage';
import { LoginPage, SignupPage } from './features/auth/pages/AuthPages';
import ForgotPasswordPage from './features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from './features/auth/pages/ResetPasswordPage';
import DateTimePage from './features/booking/pages/DateTimePage';
import TicketSelectionPage from './features/booking/pages/TicketSelectionPage';
import UserDetailsPage from './features/booking/pages/UserDetailsPage';
import PaymentPage from './features/booking/pages/PaymentPage';
import ConfirmationPage from './features/booking/pages/ConfirmationPage';

// Admin Pages
import AdminDashboard from './features/admin/pages/AdminDashboardStitch';
import SlotManagement from './features/admin/pages/SlotManagementStitch';
import BookingManagement from './features/admin/pages/BookingManagementStitch';
import RevenueAnalytics from './features/admin/pages/RevenueAnalyticsStitch';
import PricingManagement from './features/admin/pages/PricingManagementStitch';
import UserManagement from './features/admin/pages/UserManagementStitch';

// Staff Pages
import GatekeeperDashboard from './features/staff/pages/GatekeeperDashboard';

// This component handles the automatic redirect to home on refresh/mount
const RefreshRedirector = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // On every fresh load of the app (refresh), if we aren't at home, go home.
    if (location.pathname !== '/') {
      console.log('🔄 Tab refreshed or app reloaded. Redirecting to landing page...');
      navigate('/', { replace: true });
    }
  }, []); // Run once on mount

  return null;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <RefreshRedirector />
        <div className="app-container min-h-screen bg-background">
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          {/* Booking Flow */}
          <Route path="/book/date" element={<DateTimePage />} />
          <Route path="/book/tickets" element={<TicketSelectionPage />} />
          <Route path="/book/details" element={<UserDetailsPage />} />
          <Route path="/book/payment" element={<PaymentPage />} />
          <Route path="/booking/confirmation" element={<ConfirmationPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRoles={['ROLE_ADMIN', 'ROLE_SLOTS', 'ROLE_PRICING', 'ROLE_BOOKINGS', 'ROLE_ANALYTICS']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="slots" element={<SlotManagement />} />
            <Route path="bookings" element={<BookingManagement />} />
            <Route path="analytics" element={<RevenueAnalytics />} />
            <Route path="pricing" element={<PricingManagement />} />
            <Route path="users" element={<UserManagement />} />
          </Route>

          {/* Staff/Gatekeeper Routes */}
          <Route path="/staff/gatekeeper" element={
            <ProtectedRoute requiredRoles={['ROLE_GATEKEEPER', 'ROLE_ADMIN']}>
              <GatekeeperDashboard />
            </ProtectedRoute>
          } />
          {/* Catch-all: redirect any unknown route to landing page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
