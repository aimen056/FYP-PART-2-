import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LoadingPage from "../../pages/LoadingPage";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, token, isLoading } = useAuth();

  if (isLoading) return <LoadingPage />;
  if (!token || !user?.loggedIn) return <Navigate to="/login" replace />;
  if (adminOnly && user.email !== import.meta.env.VITE_ADMIN_EMAIL) {
    return <Navigate to="/userdashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
