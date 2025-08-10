import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { getFirestore, doc, getDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';

const db = getFirestore();

export default function CoursePage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [content, setContent] = useState([]); // State for course content
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) return;
      setLoading(true);
      try {
        // Fetch main course details
        const courseDocRef = doc(db, 'courses', courseId);
        const courseDocSnap = await getDoc(courseDocRef);

        if (courseDocSnap.exists()) {
          setCourse({ id: courseDocSnap.id, ...courseDocSnap.data() });

          // Fetch content sub-collection, ordered by the 'order' field
          const contentRef = collection(db, 'courses', courseId, 'content');
          const q = query(contentRef, orderBy('order'));
          const contentSnapshot = await getDocs(q);
          const contentData = contentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setContent(contentData);

        } else {
          console.log("No such course!");
        }
      } catch (error) {
        console.error("Error fetching course data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  return (
    <Layout>
      {loading ? (
        <p>Loading course details...</p>
      ) : course ? (
        <div>
          <h1 className="text-4xl font-bold text-gray-900">{course.title}</h1>
          <p className="text-lg text-gray-600 mt-4">{course.description}</p>
          <div className="mt-8 border-t pt-6">
            <h2 className="text-2xl font-semibold mb-4">Course Content</h2>
            {content.length > 0 ? (
              <ul className="space-y-2">
                {content.map((item) => (
                  <li key={item.id} className="p-4 bg-gray-100 rounded-md">
                    <span className="font-medium">{item.title}</span>
                    {/* We will render the actual content here next */}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No content has been added to this course yet.</p>
            )}
          </div>
        </div>
      ) : (
        <p>Course not found.</p>
      )}
    </Layout>
  );
}