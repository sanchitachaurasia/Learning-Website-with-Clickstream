import React from 'react';
import { getFirestore, doc, updateDoc, arrayUnion, arrayRemove, setDoc } from 'firebase/firestore';

const db = getFirestore();

export default function CompletionButton({ user, courseId, contentId, isCompleted }) {
  const handleToggleComplete = async () => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const progressField = `progress.${courseId}.completedContent`;

    // Using setDoc with merge: true ensures the nested objects are created if they don't exist
    await setDoc(userRef, {
        progress: {
            [courseId]: {
                completedContent: isCompleted ? arrayRemove(contentId) : arrayUnion(contentId)
            }
        }
    }, { merge: true });
  };

  return (
    <div className="text-right mt-4">
      <button
        onClick={handleToggleComplete}
        className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
          isCompleted
            ? 'bg-green-100 text-green-800 hover:bg-green-200'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        {isCompleted ? '✅ Completed' : 'Mark as Complete'}
      </button>
    </div>
  );
}