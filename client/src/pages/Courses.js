import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc, setDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';

const db = getFirestore();

export default function Courses() {
  const [user] = useAuthState(auth);
  const [courses, setCourses] = useState([]);
  const [registeredCourseIds, setRegisteredCourseIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch all courses
        const coursesSnapshot = await getDocs(collection(db, 'courses'));
        const coursesData = coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCourses(coursesData);

        // Fetch user's registered courses
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setRegisteredCourseIds(new Set(userDoc.data().registeredCourses || []));
        }
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleRegister = async (courseId) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);

    // Ensure user document exists before updating
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
        await setDoc(userDocRef, { registeredCourses: [courseId] });
    } else {
        await updateDoc(userDocRef, {
          registeredCourses: arrayUnion(courseId),
        });
    }

    setRegisteredCourseIds(prev => new Set(prev).add(courseId));
  };

  const handleDeregister = async (courseId) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, {
      registeredCourses: arrayRemove(courseId),
    });
    setRegisteredCourseIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(courseId);
      return newSet;
    });
  };

  return (
    <Layout>
      <h1 className="text-3xl font-bold text-gray-800">All Courses</h1>
      {loading ? (
        <p className="mt-4">Loading courses...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {courses.map(course => {
            const isRegistered = registeredCourseIds.has(course.id);
            return (
              <div key={course.id} className="bg-white rounded-lg shadow-lg p-6 flex flex-col justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{course.title}</h2>
                  <p className="text-gray-600 mt-2">{course.description}</p>
                </div>
                <button
                  onClick={() => isRegistered ? handleDeregister(course.id) : handleRegister(course.id)}
                  className={`w-full mt-4 px-4 py-2 font-bold text-white rounded-md ${
                    isRegistered
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isRegistered ? 'Deregister' : 'Register'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}