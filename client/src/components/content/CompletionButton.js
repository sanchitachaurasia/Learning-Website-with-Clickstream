import React from 'react';
import { getFirestore, doc, setDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

const db = getFirestore();

export default function CompletionButton({ user, courseId, contentId, isCompleted, onUpdate, courseTitle }) {
  const handleToggleComplete = async () => {
    if (!user) return;
    
    const userRef = doc(db, 'users', user.uid);
    const progressField = `progress.${courseId}.completedContent`;

    // Using setDoc with merge: true ensures the nested objects are created if they don't exist.
    // This is robust and prevents errors if a user has no progress object yet.
    await setDoc(userRef, {
        progress: {
            [courseId]: {
                completedContent: isCompleted ? arrayRemove(contentId) : arrayUnion(contentId)
            }
        }
    }, { merge: true });

    // This is the crucial part that tells the parent (CoursePage) to update its state,
    // which makes the UI change instantly without a page refresh.
    if (onUpdate) {
      onUpdate(contentId, !isCompleted);
    }
  };

  return (
    <div className="text-right mt-4">
      <button
        onClick={handleToggleComplete}
        data-analytics-id="completion-button"
        data-course-id={courseId}
        data-content-id={contentId}
        data-completed-status={isCompleted}
        data-course-title={courseTitle} // Add this attribute
        className={`...`}
      >
        {isCompleted ? '✅ Completed' : 'Mark as Complete'}
      </button>
    </div>
  );
}