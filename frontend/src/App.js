/**
 * App.js - Root component with routing and providers
 */
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider }          from './context/CartContext';
import { WishlistProvider }      from './context/WishlistContext';

import Navbar           from './components/common/Navbar';
import Footer           from './components/common/Footer';
import HomePage         from './pages/HomePage';
import ProductListPage  from './pages/ProductListPage';
import ProductDetail    from './pages/ProductDetail';
import CartPage         from './pages/CartPage';
import CheckoutPage     from './pages/CheckoutPage';
import OrderConfirm     from './pages/OrderConfirm';
import OrderHistory     from './pages/OrderHistory';
import WishlistPage     from './pages/WishlistPage';
import LoginPage        from './pages/LoginPage';
import SignupPage       from './pages/SignupPage';
import AccountPage      from './pages/AccountPage';
import ProfileEditPage  from './pages/ProfileEditPage';

// Protected route - redirects to login if not authenticated
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="spinner" />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AppRoutes = () => (
  <>
    <Navbar />
    <Routes>
      <Route path="/"                element={<HomePage />} />
      <Route path="/products"        element={<ProductListPage />} />
      <Route path="/products/:id"    element={<ProductDetail />} />
      <Route path="/login"           element={<LoginPage />} />
      <Route path="/signup"          element={<SignupPage />} />

      {/* Protected Routes */}
      <Route path="/cart"            element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
      <Route path="/checkout"        element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
      <Route path="/order-confirm/:id" element={<ProtectedRoute><OrderConfirm /></ProtectedRoute>} />
      <Route path="/orders"          element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
      <Route path="/wishlist"        element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
      <Route path="/account"         element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
      <Route path="/account/profile" element={<ProtectedRoute><ProfileEditPage /></ProtectedRoute>} />
      <Route path="/account/address" element={<ProtectedRoute><ProfileEditPage /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    <Footer />
  </>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <AppRoutes />
            <ToastContainer
              position="bottom-right"
              autoClose={2500}
              hideProgressBar={false}
              closeOnClick
              pauseOnHover
              theme="light"
            />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
