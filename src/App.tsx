// src/App.tsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import theme from "./utils/theme";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import About from "./components/About";
import Vote from "./components/Vote";
import ClubRegistration from "./components/ClubRegistration";
import AdminLogin from "./admin/AdminLogin";
import AdminDashboard from "./admin/AdminDashboard";
import { AuthProvider, useAuth } from "./context/AuthContext"; // ← Import

// Protected Route
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAdmin } = useAuth(); // ← Same shared state!
  return isAdmin ? <>{children}</> : <Navigate to="/admin-login" replace />;
};

// Public Layout
const PublicLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <>
    <Navbar />
    {children}
  </>
);

const App: React.FC = () => {
  const { login, logout } = useAuth(); // ← Still here for passing to components

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <PublicLayout>
                <Home />
              </PublicLayout>
            }
          />
          <Route
            path="/about"
            element={
              <PublicLayout>
                <About />
              </PublicLayout>
            }
          />
          <Route
            path="/vote"
            element={
              <PublicLayout>
                <Vote />
              </PublicLayout>
            }
          />
          <Route
            path="/register-club"
            element={
              <PublicLayout>
                <ClubRegistration />
              </PublicLayout>
            }
          />
          {/* Admin Routes */}
          <Route path="/admin-login" element={<AdminLogin onLogin={login} />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard onLogout={logout} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={<Navigate to="/admin" replace />}
          />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

// Wrap everything with AuthProvider
const WrappedApp: React.FC = () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);

export default WrappedApp;
