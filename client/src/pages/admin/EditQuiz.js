import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';

const db = getFirestore();

// Updated template for new questions
const newQuestionTemplate = {
  question: '',
  type: 'multiple_choice', // Default to multiple choice
  options: ['', '', '', ''],
  correctIndex: 0,
  correctAnswer: '', // For text/number input
};

export default function EditQuiz() {
  const { courseId, contentId } = useParams();
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  // --- Generic handler for any field on a question ---
  const handleQuestionChange = (qIndex, field, value) => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions[qIndex][field] = value;
    setQuizData({ ...quizData, questions: updatedQuestions });
  };

  const handleOptionChange = (qIndex, optIndex, newText) => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions[qIndex].options[optIndex] = newText;
    setQuizData({ ...quizData, questions: updatedQuestions });
  };

  const addQuestion = () => {
    setQuizData({ ...quizData, questions: [...quizData.questions, newQuestionTemplate] });
  };

  const removeQuestion = (qIndex) => {
    if (window.confirm(`Are you sure you want to remove Question ${qIndex + 1}?`)) {
      const updatedQuestions = quizData.questions.filter((_, index) => index !== qIndex);
      setQuizData({ ...quizData, questions: updatedQuestions });
    }
  };

  const handleUpdateQuiz = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const quizDocRef = doc(db, 'courses', courseId, 'content', contentId);
      await updateDoc(quizDocRef, quizData);
      setSuccess('Quiz updated successfully!');
    } catch (err) {
      setError('Failed to update quiz.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <Layout><p>Loading quiz editor...</p></Layout>;
  if (error) return <Layout><p className="text-red-500">{error}</p></Layout>;

  return (
    <Layout>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Quiz</h1>
      {quizData && (
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
          <form onSubmit={handleUpdateQuiz} className="space-y-8">
            <div>
              <label htmlFor="quizTitle" className="block text-lg font-medium text-gray-700">Quiz Title</label>
              <input
                type="text"
                id="quizTitle"
                value={quizData.title}
                onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm"
              />
            </div>

            {quizData.questions.map((q, qIndex) => (
              <div key={qIndex} className="p-6 border border-gray-200 rounded-lg relative">
                <button type="button" onClick={() => removeQuestion(qIndex)} className="absolute top-2 right-2 px-2 py-1 text-xs font-bold text-white bg-red-600 rounded-md hover:bg-red-700">&times;</button>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-md font-medium text-gray-700">Question {qIndex + 1}</label>
                        <textarea value={q.question} onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)} rows="2" className="w-full mt-1 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div>
                         <label className="block text-md font-medium text-gray-700">Question Type</label>
                         <select value={q.type} onChange={(e) => handleQuestionChange(qIndex, 'type', e.target.value)} className="w-full mt-1 border border-gray-300 rounded-md shadow-sm bg-white p-2">
                            <option value="multiple_choice">Multiple Choice</option>
                            <option value="text_input">Text Input</option>
                            <option value="number_input">Number Input</option>
                         </select>
                    </div>
                </div>

                {/* CONDITIONAL RENDERING FOR ANSWER INPUTS */}
                {q.type === 'multiple_choice' ? (
                    <div className="mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {q.options.map((opt, optIndex) => (
                                <div key={optIndex}>
                                    <label className="block text-sm font-medium text-gray-600">Option {optIndex + 1}</label>
                                    <input type="text" value={opt} onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)} className="w-full mt-1 border border-gray-300 rounded-md shadow-sm" />
                                </div>
                            ))}
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-600">Correct Answer</label>
                            <select value={q.correctIndex} onChange={(e) => handleQuestionChange(qIndex, 'correctIndex', parseInt(e.target.value, 10))} className="w-full mt-1 border border-gray-300 rounded-md shadow-sm bg-white p-2">
                                {q.options.map((opt, optIndex) => (<option key={optIndex} value={optIndex}>Option {optIndex + 1}</option>))}
                            </select>
                        </div>
                    </div>
                ) : (
                     <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-600">Correct Answer</label>
                        <input
                            type={q.type === 'number_input' ? 'number' : 'text'}
                            value={q.correctAnswer}
                            onChange={(e) => handleQuestionChange(qIndex, 'correctAnswer', e.target.value)}
                            className="w-full mt-1 border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>
                )}
              </div>
            ))}

            <div className="pt-4"><button type="button" onClick={addQuestion} className="w-full px-6 py-2 font-semibold text-blue-600 border-2 border-dashed border-blue-400 rounded-md hover:bg-blue-50">+ Add Question</button></div>
            <div className="pt-6 border-t">
              {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
              {success && <p className="text-sm text-green-600 mb-4">{success}</p>}
              <button type="submit" disabled={isSubmitting} className="w-full px-6 py-3 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400">{isSubmitting ? 'Saving...' : 'Save All Changes'}</button>
            </div>
          </form>
        </div>
      )}
    </Layout>
  );
}