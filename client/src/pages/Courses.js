import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const db = getFirestore();

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'courses'));
        const coursesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCourses(coursesData);
      } catch (error) {
        console.error("Error fetching courses: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <Layout>
      <h1 className="text-3xl font-bold text-gray-800">All Courses</h1>
      {loading ? (
        <p className="mt-4">Loading courses...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {courses.map(course => (
            <div key={course.id} className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900">{course.title}</h2>
              <p className="text-gray-600 mt-2">{course.description}</p>
              {/* We will add a register button here later */}
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}