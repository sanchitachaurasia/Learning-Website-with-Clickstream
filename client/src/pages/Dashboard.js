import React from 'react';
import Layout from '../components/Layout';

export default function Dashboard() {
  return (
    <Layout>
      <h1 className="text-3xl font-bold text-gray-800">Your Dashboard</h1>
      <p className="mt-2 text-gray-600">Your registered courses will appear here.</p>
    </Layout>
  );
}