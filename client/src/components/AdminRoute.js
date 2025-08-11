import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdmin } from '../hooks/useAdmin';

export default function AdminRoute({ children }) {
  const { isAdmin, loading } = useAdmin();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg font-semibold">Checking permissions...</p>
      </div>
    );
  }

  if (!isAdmin) {
    // Redirect non-admin users to the regular dashboard
    return <Navigate to="/dashboard" />;
  }

  // If the user is an admin, render the child components
  return children;
}