import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const db = getFirestore();

export default function EditQuiz() {
  const { courseId, contentId } = useParams();
  const navigate = useNavigate();

  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      try {
        const quizDocRef = doc(db, 'courses', courseId, 'content', contentId);
        const quizDocSnap = await getDoc(quizDocRef);
        if (quizDocSnap.exists()) {
          setQuizData(quizDocSnap.data());
        } else {
          setError("Quiz not found.");
        }
      } catch (err) {
        setError("Failed to fetch quiz data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [courseId, contentId]);

  const handleQuestionTextChange = (qIndex, newText) => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions[qIndex].question = newText;
    setQuizData({ ...quizData, questions: updatedQuestions });
  };

  const handleOptionChange = (qIndex, optIndex, newText) => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions[qIndex].options[optIndex] = newText;
    setQuizData({ ...quizData, questions: updatedQuestions });
  };

  const handleCorrectIndexChange = (qIndex, newIndex) => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions[qIndex].correctIndex = parseInt(newIndex, 10);
    setQuizData({ ...quizData, questions: updatedQuestions });
  }

  if (loading) {
    return <Layout><p>Loading quiz editor...</p></Layout>;
  }

  if (error) {
    return <Layout><p className="text-red-500">{error}</p></Layout>;
  }

  return (
    <Layout>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Quiz</h1>
      {quizData && (
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
          <form className="space-y-8">
            <div>
              <label htmlFor="quizTitle" className="block text-lg font-medium text-gray-700">Quiz Title</label>
              <input
                type="text"
                id="quizTitle"
                value={quizData.title}
                onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {quizData.questions.map((q, qIndex) => (
              <div key={qIndex} className="p-6 border border-gray-200 rounded-lg">
                <label className="block text-md font-medium text-gray-700">Question {qIndex + 1}</label>
                <textarea
                  value={q.question}
                  onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)}
                  rows="2"
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm"
                />
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {q.options.map((opt, optIndex) => (
                    <div key={optIndex}>
                      <label className="block text-sm font-medium text-gray-600">Option {optIndex + 1}</label>
                       <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                        className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm"
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-600">Correct Answer</label>
                    <select 
                        value={q.correctIndex} 
                        onChange={(e) => handleCorrectIndexChange(qIndex, e.target.value)}
                        className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm bg-white"
                    >
                        {q.options.map((opt, optIndex) => (
                            <option key={optIndex} value={optIndex}>Option {optIndex + 1}</option>
                        ))}
                    </select>
                </div>
              </div>
            ))}

            {/* The Save button will be added in the next step */}
          </form>
        </div>
      )}
    </Layout>
  );
}