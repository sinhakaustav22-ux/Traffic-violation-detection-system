/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';

// Pages
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ViolationsPage from './pages/ViolationsPage.jsx';
import ViolationDetailPage from './pages/ViolationDetailPage.jsx';
import UploadPage from './pages/UploadPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import ChallansPage from './pages/ChallansPage.jsx';
import AlertsPage from './pages/AlertsPage.jsx';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = null }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF9933]"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#333',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#138808',
                },
              },
              error: {
                style: {
                  background: '#EF4444',
                },
              },
            }}
          />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/violations" 
              element={
                <ProtectedRoute>
                  <ViolationsPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/violations/:id" 
              element={
                <ProtectedRoute>
                  <ViolationDetailPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/upload" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'officer']}>
                  <UploadPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute>
                  <AnalyticsPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/challans" 
              element={
                <ProtectedRoute>
                  <ChallansPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/alerts" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'officer']}>
                  <AlertsPage />
                </ProtectedRoute>
              } 
            />
            
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}
