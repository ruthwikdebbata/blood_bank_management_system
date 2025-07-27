// src/client/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Inventory from './pages/Inventory';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import StaffDashboard from './pages/StaffDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Profile from './pages/Profile';
import DonationHistory from './pages/DonationHistory';
import SupportResources from './pages/SupportResources';
import TransactBlood from './pages/TransactBlood';

export default function App() {
  return (
    <div>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/inventory"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'User', 'Staff']}>
                <Inventory />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin_dashboard"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user_dashboard"
            element={
              <ProtectedRoute allowedRoles={['User']}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/staff_dashboard"
            element={
              <ProtectedRoute allowedRoles={['Staff']}>
                <StaffDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/donations"
            element={
              <ProtectedRoute allowedRoles={['User', 'Admin', 'Staff']}>
                <DonationHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/support"
            element={
              <ProtectedRoute allowedRoles={['User', 'Staff', 'Admin']}>
                <SupportResources />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transact"
            element={
              <ProtectedRoute allowedRoles={['User', 'Staff', 'Admin']}>
                <TransactBlood />
              </ProtectedRoute>
            }
          />

        </Routes>
      </main>
    </div>
  );
}
