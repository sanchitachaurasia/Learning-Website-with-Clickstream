import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const db = getFirestore();

export default function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manage Courses</h1>
        <Link to="/admin/create-course" className="px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700">
          + Create New Course
        </Link>
      </div>
      {loading ? (
        <p>Loading courses...</p>
      ) : (
        <div className="bg-white rounded-lg shadow-lg">
          <ul className="divide-y divide-gray-200">
            {courses.map(course => (
              <li key={course.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="text-lg font-semibold text-gray-900">{course.title}</p>
                  <p className="text-sm text-gray-500">{course.id}</p>
                </div>
                <Link
                  to={`/admin/edit-course/${course.id}`}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                  Edit
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Layout>
  );
}