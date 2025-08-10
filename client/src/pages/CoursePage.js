import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const db = getFirestore();

export default function CoursePage() {
  const { courseId } = useParams(); // Get courseId from URL
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const docRef = doc(db, 'courses', courseId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setCourse({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.log("No such course!");
        }
      } catch (error) {
        console.error("Error fetching course: ", error);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  return (
    <Layout>
      {loading ? (
        <p>Loading course details...</p>
      ) : course ? (
        <div>
          <h1 className="text-4xl font-bold text-gray-900">{course.title}</h1>
          <p className="text-lg text-gray-600 mt-4">{course.description}</p>
          <div className="mt-8">
            {/* Course content will go here */}
            <h2 className="text-2xl font-semibold">Course Content</h2>
            <p className="mt-2">Lessons and quizzes will appear here soon!</p>
          </div>
        </div>
      ) : (
        <p>Course not found.</p>
      )}
    </Layout>
  );
}