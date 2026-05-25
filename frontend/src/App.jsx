import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import ProtectedRoute from './routes/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

import Medicines from './pages/Medicines';
import MedicineDetails from './pages/MedicineDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import UploadPrescription from './pages/UploadPrescription';
import OrderHistory from './pages/OrderHistory';
import Profile from './pages/Profile';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import ManageMedicines from './pages/ManageMedicines';
import ManageOrders from './pages/ManageOrders';
import ManagePrescriptions from './pages/ManagePrescriptions';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

              <Route path="/medicines" element={<Medicines />} />
              <Route path="/medicines/:id" element={<MedicineDetails />} />

              {/* Protected Customer Routes */}
              <Route
                path="/cart"
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER']}>
                    <Cart />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER']}>
                    <Checkout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/prescription/upload"
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER']}>
                    <UploadPrescription />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders/history"
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER']}>
                    <OrderHistory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Protected Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/medicines"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <ManageMedicines />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <ManageOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/prescriptions"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <ManagePrescriptions />
                  </ProtectedRoute>
                }
              />
              
              {/* Fallback to Home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
    </ToastProvider>
  );
}

export default App;
