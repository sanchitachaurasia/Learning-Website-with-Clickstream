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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyCourses = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Get user's registered course IDs
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists() && userDoc.data().registeredCourses?.length > 0) {
          const registeredIds = userDoc.data().registeredCourses;

          // Query the courses collection for those IDs
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
          {myCourses.map(course => (
            <Link to={`/courses/${course.id}`} key={course.id} className="block hover:shadow-xl transition-shadow duration-300">
                <div className="bg-white rounded-lg shadow-lg p-6 h-full">
                <h2 className="text-xl font-bold text-gray-900">{course.title}</h2>
                <p className="text-gray-600 mt-2">{course.description}</p>
                </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-gray-600">You are not registered for any courses yet. Go to "All Courses" to explore.</p>
      )}
    </Layout>
  );
}