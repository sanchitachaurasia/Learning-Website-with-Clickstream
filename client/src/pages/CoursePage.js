import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { getFirestore, doc, getDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { logEvent } from '../utils/logEvent';
import Layout from '../components/Layout';
import TextContent from '../components/content/TextContent';
import VideoContent from '../components/content/VideoContent';
import QuizComponent from '../components/content/QuizComponent';
import CompletionButton from '../components/content/CompletionButton';

const db = getFirestore();

export default function CoursePage() {
  const { courseId } = useParams();
  const [user] = useAuthState(auth);
  const [course, setCourse] = useState(null);
  const [content, setContent] = useState([]);
  const [progress, setProgress] = useState(new Set()); // Using a Set for efficient lookups
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseData = async () => {
      // Don't run fetch if we don't have the user or courseId yet
      if (!user || !courseId) return; 
      
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

          // Fetch user progress for this specific course
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            const courseProgress = userData.progress?.[courseId]?.completedContent || [];
            setProgress(new Set(courseProgress));
          }

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
  }, [courseId, user]); // Re-run effect if user or courseId changes

  // This function allows the child button to update this page's state instantly
  const handleProgressUpdate = (contentId, isNowCompleted) => {
    setProgress(prevProgress => {
      const newProgress = new Set(prevProgress);
      if (isNowCompleted) {
        newProgress.add(contentId);
      } else {
        newProgress.delete(contentId);
      }
      return newProgress;
    });
  };

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
              <ul className="space-y-4">
                {content.map((item) => {
                  const isCompleted = progress.has(item.id);
                  return (
                    <li key={item.id} className="p-6 bg-white rounded-lg shadow">
                      <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                      {item.type === 'text' && <TextContent data={item} />}
                      {item.type === 'video' && <VideoContent data={item} courseId={courseId} user={user} />}
                      {item.type === 'quiz' && <QuizComponent data={item} courseId={courseId} user={user} />}
                      <CompletionButton
                        user={user}
                        courseId={courseId}
                        contentId={item.id}
                        isCompleted={isCompleted}
                        onUpdate={handleProgressUpdate}
                      />
                    </li>
                  );
                })}
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