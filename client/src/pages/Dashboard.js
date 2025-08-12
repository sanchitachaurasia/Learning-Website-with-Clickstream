import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getFirestore, collection, doc, getDoc, query, where, getDocs } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { Link } from 'react-router-dom';

const db = getFirestore();

export default function Dashboard() {
  const [user] = useAuthState(auth);
  const [myCourses, setMyCourses] = useState([]);
  const [progressData, setProgressData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyCourses = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        // Get user's document to find registered courses and progress
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists() && userDoc.data().registeredCourses?.length > 0) {
          const userData = userDoc.data();
          setProgressData(userData.progress || {}); // Store the entire progress object
          const registeredIds = userData.registeredCourses;

          // Query the courses collection for those specific IDs
          const coursesRef = collection(db, 'courses');
          const q = query(coursesRef, where('__name__', 'in', registeredIds));
          const querySnapshot = await getDocs(q);

          const coursesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setMyCourses(coursesData);
        } else {
          setMyCourses([]); // User is registered for no courses
        }
      } catch (error) {
        console.error("Error fetching user courses: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyCourses();
  }, [user]);

  return (
    <Layout>
      <h1 className="text-3xl font-bold text-gray-800">Your Dashboard</h1>
      {loading ? (
        <p className="mt-4">Loading your courses...</p>
      ) : myCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {myCourses.map(course => {
            // Calculate progress percentage for this specific course
            const totalContent = course.contentCount || 1; // Default to 1 to avoid division by zero
            const completedCount = progressData[course.id]?.completedContent?.length || 0;
            const progressPercentage = Math.round((completedCount / totalContent) * 100);

            return (
              <Link to={`/courses/${course.id}`} key={course.id} data-analytics-id="dashboard-course-card" data-course-id={course.id} data-course-title={course.title} className="block bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 truncate">{course.title}</h2>
                  <p className="text-gray-600 mt-2 h-10 overflow-hidden text-sm">{course.description}</p>
                  
                  {/* Progress Bar Section */}
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-sm font-medium text-blue-700">{progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 text-center py-10 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700">No Courses Yet!</h2>
            <p className="mt-2 text-gray-500">You are not registered for any courses. </p>
            <Link to="/courses" data-analytics-id="explore-courses-link" className="mt-4 inline-block px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
              Explore Courses
            </Link>
        </div>
      )}
    </Layout>
  );
}