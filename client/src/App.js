import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";
import React, { useEffect } from 'react';
import { handleGlobalClick } from "./utils/analytics";

import Header from "./components/Header";
import AdminRoute from "./components/AdminRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import CoursePage from "./pages/CoursePage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CreateCourse from "./pages/admin/CreateCourse";
import ManageCourses from "./pages/admin/ManageCourses";
import EditCourse from "./pages/admin/EditCourse";
import ManageContent from "./pages/admin/ManageContent";
import EditQuiz from "./pages/admin/EditQuiz";
import ManageUsers from "./pages/admin/ManageUsers";

function App() {
  const [user, loading] = useAuthState(auth);

  // This effect attaches the global click listener
  useEffect(() => {
    const listener = (event) => {
      // Pass the event and user's UID to our handler
      handleGlobalClick(event, user ? user.uid : null);
    };

    // Listen for 'mousedown' which is often better for tracking clicks
    document.addEventListener('mousedown', listener);

    // Cleanup: remove the listener when the component unmounts
    return () => {
      document.removeEventListener('mousedown', listener);
    };
  }, [user]); // Re-run if the user logs in or out

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg font-semibold">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Router>
        {user && <Header />} {/* Conditionally render the Header */}
        <Routes>

          {/* Public and User Routes */}
          {/* If user is logged in, default route is dashboard. Otherwise, it's login. */}
          <Route
            path="/"
            element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
          />

          {/* Auth routes: if user is logged in, redirect them away from login/register */}
          <Route
            path="/login"
            element={user ? <Navigate to="/dashboard" /> : <Login />}
          />

          <Route
            path="/register"
            element={user ? <Navigate to="/dashboard" /> : <Register />}
          />

          {/* Protected route: if user is not logged in, redirect them to login */}
          <Route
            path="/dashboard"
            element={user ? <Dashboard /> : <Navigate to="/login" />}
          />

          <Route
            path="/courses"
            element={user ? <Courses /> : <Navigate to="/login" />}
          />

          <Route
            path="/courses/:courseId"
            element={user ? <CoursePage /> : <Navigate to="/login" />}
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={<AdminRoute><AdminDashboard /></AdminRoute>}
          />

          <Route
            path="/admin/create-course"
            element={<AdminRoute><CreateCourse /></AdminRoute>}
          />

          <Route 
            path="/admin/manage-courses" 
            element={<AdminRoute><ManageCourses /></AdminRoute>} 
          />

          <Route 
            path="/admin/edit-course/:courseId" 
            element={<AdminRoute><EditCourse /></AdminRoute>} 
          />

          <Route 
            path="/admin/course/:courseId/manage-content" 
            element={<AdminRoute><ManageContent /></AdminRoute>} 
          />

          <Route
            path="/admin/course/:courseId/edit-quiz/:contentId" 
            element={<AdminRoute><EditQuiz /></AdminRoute>} 
          />

          <Route 
            path="/admin/manage-users"
            element={<AdminRoute><ManageUsers /></AdminRoute>} 
          />

        </Routes>
      </Router>
    </div>
  );
}

export default App;