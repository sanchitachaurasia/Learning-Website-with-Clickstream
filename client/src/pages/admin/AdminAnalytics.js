import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const db = getFirestore();

export default function AdminAnalytics() {
  const [stats, setStats] = useState({ totalUsers: 0, totalCourses: 0, totalEvents: 0 });
  const [eventsByType, setEventsByType] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all collections in parallel
        const [usersSnapshot, coursesSnapshot, clickstreamSnapshot] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'courses')),
          getDocs(collection(db, 'clickstream'))
        ]);

        const clickstreamData = clickstreamSnapshot.docs.map(doc => doc.data());

        // Process data for charts
        const eventCounts = clickstreamData.reduce((acc, event) => {
          const eventName = event['Event name'] || 'unknown';
          acc[eventName] = (acc[eventName] || 0) + 1;
          return acc;
        }, {});

        const chartData = Object.keys(eventCounts).map(name => ({
          name,
          count: eventCounts[name]
        }));

        setEventsByType(chartData);
        setStats({
          totalUsers: usersSnapshot.size,
          totalCourses: coursesSnapshot.size,
          totalEvents: clickstreamSnapshot.size,
        });

      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <Layout><p>Loading analytics dashboard...</p></Layout>;
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">System Analytics</h1>
        {/* Export button will go here */}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <h3 className="text-4xl font-bold text-blue-600">{stats.totalUsers}</h3>
          <p className="text-gray-500 mt-1">Total Users</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <h3 className="text-4xl font-bold text-blue-600">{stats.totalCourses}</h3>
          <p className="text-gray-500 mt-1">Total Courses</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <h3 className="text-4xl font-bold text-blue-600">{stats.totalEvents}</h3>
          <p className="text-gray-500 mt-1">Total Clickstream Events</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Events by Type</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={eventsByType} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} interval={0} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Layout>
  );
}