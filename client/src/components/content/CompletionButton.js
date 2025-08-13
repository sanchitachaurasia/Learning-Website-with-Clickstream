import React, { useState } from 'react';
import { getFirestore, doc, setDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

const db = getFirestore();

export default function CompletionButton({ user, courseId, contentId, isCompleted, onUpdate, courseTitle }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleComplete = async () => {
    if (!user || isLoading) return;
    
    setIsLoading(true);
    
    try {
      const userRef = doc(db, 'users', user.uid);

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
    } catch (error) {
      console.error('Error updating completion status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="text-right mt-4">
      <button
        onClick={handleToggleComplete}
        disabled={isLoading}
        data-analytics-id="completion-button"
        data-course-id={courseId}
        data-content-id={contentId}
        data-completed-status={isCompleted}
        data-course-title={courseTitle}
        className={`
          inline-flex items-center px-3 py-2 rounded text-xs font-medium
          transition-colors duration-150
          focus:outline-none focus:ring-1 focus:ring-offset-1
          disabled:opacity-60 disabled:cursor-not-allowed
          ${isCompleted 
            ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100' 
            : 'bg-blue-500 text-white hover:bg-blue-600'
          }
        `}
      >
        {isLoading ? (
          '...'
        ) : isCompleted ? (
          <>
            ✓ Completed
          </>
        ) : (
          'Mark Complete'
        )}
      </button>
    </div>
  );
}