import React from 'react';
import Layout from '../../components/Layout';

export default function AdminAnalytics() {
  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">System Analytics</h1>
        {/* Export button will go here */}
      </div>
      <p>Statistics and charts will be displayed here soon.</p>
    </Layout>
  );
}