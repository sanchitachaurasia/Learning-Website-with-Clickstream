import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';

export default function AdminDashboard() {
  return (
    <Layout>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/admin/manage-courses" className="block p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
          <h2 className="text-xl font-bold text-gray-900">Manage Courses</h2>
          <p className="text-gray-600 mt-2">Edit, delete, and manage course content.</p>
        </Link>
        <Link to="/admin/manage-users" className="block p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
          <h2 className="text-xl font-bold text-gray-900">Manage Users</h2>
          <p className="text-gray-600 mt-2">View registered users and manage admin roles.</p>
        </Link>
      </div>
    </Layout>
  );
}