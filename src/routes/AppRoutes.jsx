import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';

import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

import ResourceList from '../pages/student/ResourceList';
import ResourceDetail from '../pages/student/ResourceDetail';
import MyBookings from '../pages/student/MyBookings';
import Profile from '../pages/user/Profile';

import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminManageResources from '../pages/admin/AdminManageResources';
import AdminManageBookings from '../pages/admin/AdminManageBookings';

import NotFound from '../pages/common/NotFound';
import ProtectedRoute from './ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Authentication routes wrapped in AuthLayout */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Main campus routes wrapped in MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/resources" replace />} />
        <Route path="/resources" element={<ResourceList />} />
        <Route path="/resources/:id" element={<ResourceDetail />} />

        {/* Protected User Routes (Students, Faculty, Admins) */}
        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute>
              <MyBookings />
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

        {/* Protected Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/resources"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminManageResources />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/bookings"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminManageBookings />
            </ProtectedRoute>
          }
        />

        {/* Catch-all 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
