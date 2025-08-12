import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { getFirestore, collection, getDocs, deleteDoc, doc, writeBatch } from 'firebase/firestore'; // Import more functions

const db = getFirestore();

export default function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm("WARNING: This will delete the course and ALL its content (lessons, quizzes, etc.) permanently. This action cannot be undone. Are you sure?")) {
      try {
        // Firestore doesn't delete subcollections automatically. We must do it manually.
        // This is best done with a Cloud Function for large subcollections,
        // but for this project, a client-side batch delete will work.
        const contentRef = collection(db, 'courses', courseId, 'content');
        const contentSnapshot = await getDocs(contentRef);
        const batch = writeBatch(db);
        contentSnapshot.forEach(doc => {
          batch.delete(doc.ref);
        });
        await batch.commit();

        // Now delete the main course document
        await deleteDoc(doc(db, 'courses', courseId));

        // Refetch courses to update the list
        fetchCourses();
      } catch (error) {
        console.error("Error deleting course and its content:", error);
        alert("Failed to delete course.");
      }
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manage Courses</h1>
        <Link to="/admin/create-course" data-analytics-id="admin-create-course-link" className="px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700">
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
                <div className="flex items-center gap-2">
                    <Link
                      to={`/admin/edit-course/${course.id}`}
                      data-analytics-id="admin-edit-course-link"
                      data-course-id={course.id}
                      data-course-title={course.title}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteCourse(course.id)}
                      data-analytics-id="admin-delete-course-button"
                      data-course-id={course.id}
                      data-course-title={course.title}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                    >
                      Delete
                    </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Layout>
  );
}