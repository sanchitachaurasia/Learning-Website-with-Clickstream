import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import { getFirestore, collection, query, orderBy, getDocs } from 'firebase/firestore';

const db = getFirestore();

export default function ManageContent() {
  const { courseId } = useParams();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      if (!courseId) return;
      setLoading(true);
      try {
        const contentRef = collection(db, 'courses', courseId, 'content');
        const q = query(contentRef, orderBy('order'));
        const contentSnapshot = await getDocs(q);
        const contentData = contentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setContent(contentData);
      } catch (error) {
        console.error("Error fetching content: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [courseId]);

  const getEditLink = (item) => {
    // This function will eventually link to different editors based on content type
    if (item.type === 'quiz') {
      return `/admin/course/${courseId}/edit-quiz/${item.id}`;
    }
    // Add links for editing text or video later
    return '#';
  };

  return (
    <Layout>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Content for Course</h1>
      {loading ? (
        <p>Loading content...</p>
      ) : (
        <div className="bg-white rounded-lg shadow-lg">
          <ul className="divide-y divide-gray-200">
            {content.map(item => (
              <li key={item.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="text-base font-semibold text-gray-900">
                    <span className="text-xs font-bold uppercase text-gray-500 bg-gray-100 rounded-full px-2 py-1 mr-2">{item.type}</span>
                    {item.title}
                  </p>
                </div>
                <Link
                  to={getEditLink(item)}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-md ${item.type === 'quiz' ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}`}
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