import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import Settings from './pages/Settings';
import AdminLogin from './pages/AdminLogin';
import PackageManagement from './pages/PackageManagement';
import SubscriptionManagement from './pages/SubscriptionManagement';
import SubscriptionStats from './pages/SubscriptionStats';
import QRCodeManagement from './pages/QRCodeManagement';
import VendorManagement from './pages/VendorManagement';
import ProductManagement from './pages/ProductManagement';
import CategoryManagement from './pages/CategoryManagement';
import OrderManagement from './pages/OrderManagement';
import ReviewManagement from './pages/ReviewManagement';
import PayoutManagement from './pages/PayoutManagement';
import ReportedUsers from './pages/ReportedUsers';
import ReportedPosts from './pages/ReportedPosts';
import CashOutRequests from './pages/CashOutRequests';
import StickerManagement from './pages/StickerManagement';

// Auth check: token + user with admin/moderator level (level >= 3 or role name)
const isAuthenticated = () => {
  const token = localStorage.getItem('adminAccessToken');
  const user = localStorage.getItem('adminUser');

  if (!token || !user) return false;

  try {
    const userData = JSON.parse(user);
    const roleName = (userData.role?.name || userData.role || '').toString().toUpperCase();
    const level = userData.role?.level;
    return level >= 3 || ['ADMIN', 'SUPER_ADMIN', 'MODERATOR', 'STAFF'].includes(roleName);
  } catch {
    return false;
  }
};

const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};


function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for existing authentication on app load
    const savedUser = localStorage.getItem('adminUser');
    if (savedUser && isAuthenticated()) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        // Clear invalid user data
        localStorage.removeItem('adminUser');
        localStorage.removeItem('adminAccessToken');
        localStorage.removeItem('adminRefreshToken');
      }
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    window.location.href = '/'; // Redirect to dashboard
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAccessToken');
    localStorage.removeItem('adminRefreshToken');
    localStorage.removeItem('adminUser');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Toaster richColors position="top-right" />
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <AdminDashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <UserManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/qr-codes"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <QRCodeManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/packages"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <PackageManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/subscriptions"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <SubscriptionManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/subscription-stats"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <SubscriptionStats />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/vendors"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <VendorManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <ProductManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/categories"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <CategoryManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <OrderManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/reviews"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <ReviewManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/payouts"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <PayoutManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/reported-users"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <ReportedUsers />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/reported-posts"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <ReportedPosts />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/cashout-requests"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <CashOutRequests />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/cashout-email-change"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <CashOutRequests />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/stickers"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <StickerManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <AdminLayout user={user} onLogout={handleLogout}>
                  <Settings />
                </AdminLayout>
              </ProtectedRoute>
            }
          />


          {/* Admin Login */}
          <Route
            path="/login"
            element={<AdminLogin onLoginSuccess={handleLoginSuccess} />}
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;