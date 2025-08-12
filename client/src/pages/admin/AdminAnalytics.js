import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { getFirestore, collection, getDocs, Timestamp } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse'; // Import papaparse

const db = getFirestore();

export default function AdminAnalytics() {
  const [stats, setStats] = useState({ totalUsers: 0, totalCourses: 0, totalEvents: 0 });
  const [eventsByType, setEventsByType] = useState([]);
  const [rawClickstreamData, setRawClickstreamData] = useState([]); // State to hold raw data for export
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
        setRawClickstreamData(clickstreamData); // Save raw data

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

  const handleExportCSV = () => {
    // Sanitize data for CSV export
    const dataToExport = rawClickstreamData.map(event => {
        const sanitizedEvent = { ...event };
        // Convert Firestore Timestamps to readable strings
        if (sanitizedEvent.Time instanceof Timestamp) {
            sanitizedEvent.Time = sanitizedEvent.Time.toDate().toISOString();
        }
        // Remove raw_event_data if it exists, as it can contain complex objects
        delete sanitizedEvent.raw_event_data;
        return sanitizedEvent;
    });

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `clickstream_export_${new Date().toISOString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <Layout><p>Loading analytics dashboard...</p></Layout>;
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">System Analytics</h1>
        <button
          onClick={handleExportCSV}
          className="px-4 py-2 font-bold text-white bg-green-600 rounded-md hover:bg-green-700"
        >
          Export CSV Report
        </button>
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