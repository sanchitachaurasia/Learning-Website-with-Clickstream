import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useAdmin } from '../hooks/useAdmin';

export default function Header() {
  const [user] = useAuthState(auth);
  const { isAdmin } = useAdmin(); // Use the hook to get admin status
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigate('/login');
      })
      .catch((error) => {
        console.error('Logout Error:', error);
      });
  };

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link to="/dashboard" data-analytics-id="nav-brand-logo" className="text-xl font-bold text-gray-800">
          LearnX
        </Link>

        <div className="flex items-center">
          <Link to="/dashboard" data-analytics-id="nav-dashboard" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded">
            Dashboard
          </Link>
          <Link to="/courses" data-analytics-id="nav-all-courses" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded">
            All Courses
          </Link>
          <Link to="/my-analytics" data-analytics-id="nav-my-analytics" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded">
            My Analytics
          </Link>
          {/* Conditionally render the Admin link */}
          {isAdmin && (
            <Link to="/admin" data-analytics-id="nav-admin" className="text-red-600 font-bold hover:text-red-800 px-3 py-2 rounded">
              Admin
            </Link>
          )}
        </div>

        {user && (
          <div className="flex items-center">
            <span className="text-gray-700 text-sm mr-4">{user.email}</span>
            <button
              onClick={handleLogout}
              data-analytics-id="logout-button"
              className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Logout
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}