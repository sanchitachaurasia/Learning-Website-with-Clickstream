import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getFirestore, collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';

const db = getFirestore();

export default function MyAnalytics() {
  const [user] = useAuthState(auth);
  const [stats, setStats] = useState({ totalTime: 0, avgScore: 0, events: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        console.log("DEBUG: Effect ran, but no user is logged in yet.");
        return;
      }
      setLoading(true);
      console.log(`DEBUG: Starting fetch for user UID: ${user.uid}`);

      try {
        const clickstreamRef = collection(db, 'clickstream');
        const q = query(
          clickstreamRef,
          where('userId', '==', user.uid),
          orderBy('Time', 'desc') // Get most recent events first
        );
        const querySnapshot = await getDocs(q);
        const userData = querySnapshot.docs.map(doc => doc.data());

        // --- DIAGNOSTIC LOGS ---
        console.log(`DEBUG: Firestore query returned ${userData.length} documents.`);
        if (userData.length > 0) {
          console.log("DEBUG: First document returned:", userData[0]);
        }
        // --- END DIAGNOSTIC LOGS ---

        let totalTimeSpent = 0;
        let totalScore = 0;
        let totalQuestionsAttempted = 0;

        userData.forEach(event => {
          // Calculate total time spent from video pauses
          if (event['Event name'] === 'video_pause' && event['Time Spent (seconds)']) {
            totalTimeSpent += event['Time Spent (seconds)'];
          }
          // Calculate average quiz score
          if (event['Event name'] === 'quiz_submit' && event.Score !== null) {
            totalScore += event.Score;
            // Use the totalQuestions from the event log for accurate percentage
            totalQuestionsAttempted += event.raw_event_data?.totalQuestions || 0;
          }
        });

        const avgScore = totalQuestionsAttempted > 0 ? (totalScore / totalQuestionsAttempted) * 100 : 0;

        setStats({
          totalTime: Math.round(totalTimeSpent / 60), // Convert to minutes
          avgScore: Math.round(avgScore),
          events: userData.length,
        });

        // Set recent activity (get the latest 10 events)
        setRecentActivity(userData.slice(0, 10));

      } catch (error) {
        console.error("Error fetching user analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  if (loading) {
    return <Layout><p>Loading your analytics...</p></Layout>;
  }

  return (
    <Layout>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Learning Analytics</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <h3 className="text-4xl font-bold text-blue-600">{stats.totalTime}</h3>
          <p className="text-gray-500 mt-1">Total Minutes Spent</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <h3 className="text-4xl font-bold text-blue-600">{stats.avgScore}%</h3>
          <p className="text-gray-500 mt-1">Average Quiz Score</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <h3 className="text-4xl font-bold text-blue-600">{stats.events}</h3>
          <p className="text-gray-500 mt-1">Total Interactions Logged</p>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentActivity.map((event, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {event.Time instanceof Timestamp ? event.Time.toDate().toLocaleString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{event.Description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}