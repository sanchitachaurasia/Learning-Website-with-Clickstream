import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';

export default function AdminDashboard() {
  return (
    <Layout>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/admin/create-course" className="block p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
          <h2 className="text-xl font-bold text-gray-900">Create New Course</h2>
          <p className="text-gray-600 mt-2">Add a new math course to the catalog.</p>
        </Link>
        {/* Add more admin links here in the future, e.g., for analytics */}
      </div>
    </Layout>
  );
}