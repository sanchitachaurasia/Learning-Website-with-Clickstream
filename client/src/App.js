import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Header from "./components/Header";
import Courses from "./pages/Courses";

function App() {
  const [user, loading] = useAuthState(auth);

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
        </Routes>
      </Router>
    </div>
  );
}

export default App;