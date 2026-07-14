import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function LoadingScreen() {
  return (
    <div className="w-full h-[100dvh] flex items-center justify-center bg-ink">
      <span className="font-fredoka text-xl text-cream/60">Loading...</span>
    </div>
  );
}

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/" replace />;
  return children;
}

export function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== "admin") return <Navigate to="/discover" replace />;
  return children;
}
