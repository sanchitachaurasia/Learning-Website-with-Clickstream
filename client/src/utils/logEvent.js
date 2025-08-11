import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const db = getFirestore();

/**
 * Logs a user interaction event to the 'clickstream' collection in Firestore.
 * @param {string} userId - The UID of the authenticated user.
 * @param {Object} event - An object containing event details.
 * e.g., { eventType: 'video_play', courseId: 'abc', contentId: 'xyz' }
 */
export const logEvent = async (userId, event) => {
  if (!userId || !event) {
    console.warn("logEvent called without userId or event data.");
    return;
  }

  try {
    await addDoc(collection(db, "clickstream"), {
      userId,
      timestamp: serverTimestamp(), // Use server timestamp for accuracy
      ...event
    });
  } catch (err) {
    console.error("Error logging event:", err);
  }
};