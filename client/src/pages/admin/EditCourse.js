import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';

const db = getFirestore();

export default function EditCourse() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      try {
        const courseDocRef = doc(db, 'courses', courseId);
        const courseDocSnap = await getDoc(courseDocRef);
        if (courseDocSnap.exists()) {
          const courseData = courseDocSnap.data();
          setTitle(courseData.title);
          setDescription(courseData.description);
        } else {
          setError("Course not found.");
        }
      } catch (err) {
        setError("Failed to fetch course data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const courseDocRef = doc(db, 'courses', courseId);
      await updateDoc(courseDocRef, {
        title,
        description
      });
      setSuccess('Course updated successfully!');
    } catch (err) {
      setError('Failed to update course.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <Layout><p>Loading course editor...</p></Layout>;
  }

  return (
    <Layout>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Course</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <form onSubmit={handleUpdate} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Course Title</label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Course Description</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="6"
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              {success && <p className="text-sm text-green-600">{success}</p>}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  data-analytics-id="edit-course-form-submit"
                  data-course-id={courseId}
                  data-course-title={title}
                  className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
        <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-bold text-gray-900">Manage Content</h3>
                <p className="text-sm text-gray-600 mt-2 mb-4">Edit the lessons, quizzes, and videos for this course.</p>
                <Link to={`/admin/course/${courseId}/manage-content`} data-analytics-id="admin-manage-content-link" data-course-id={courseId} data-course-title={title} className="block w-full text-center px-4 py-2 font-bold text-white bg-gray-700 rounded-md hover:bg-gray-800">
                    Manage Course Content
                </Link>
            </div>
        </div>
      </div>
    </Layout>
  );
}