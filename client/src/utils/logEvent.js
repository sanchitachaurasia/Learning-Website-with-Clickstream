import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const db = getFirestore();

/**
 * Generates a human-readable description for a clickstream event.
 * @param {object} event - The structured event payload.
 * @returns {string} A descriptive sentence about the event.
 */
const generateLogDescription = (event) => {
  const { analyticsId, userEmail, courseTitle, elementText } = event;
  const userId = event.userId || userEmail; // Fallback to email if ID is missing

  switch (analyticsId) {
    case 'nav-dashboard':
      return `The user '${userId}' navigated to the Dashboard.`;
    case 'nav-all-courses':
      return `The user '${userId}' navigated to the All Courses page.`;
    case 'nav-admin':
      return `The admin user '${userId}' navigated to the Admin Dashboard.`;
    case 'logout-button':
      return `The user '${userId}' clicked the logout button.`;
    case 'dashboard-course-card':
      return `The user '${userId}' viewed the course '${courseTitle}' from their dashboard.`;
    case 'completion-button':
      return `The user '${userId}' marked content in course '${courseTitle}' as ${event.completedStatus === 'true' ? 'incomplete' : 'complete'}.`;
    case 'quiz-submit-button':
      return `The user '${userId}' submitted the quiz '${elementText}' in course '${courseTitle}'.`;
    case 'video-player':
      return `The user '${userId}' interacted with a video player in course '${courseTitle}'.`;
    default:
      return `The user '${userId}' clicked on a UI element with text '${elementText}'.`;
  }
};

/**
 * Logs a user interaction event to Firestore and prints a detailed message to the console.
 * @param {string} userId - The UID of the authenticated user.
 * @param {object} event - An object containing event details from the analytics handler.
 */
export const logEvent = async (userId, event) => {
  if (!userId || !event) {
    console.warn("logEvent called without userId or event data.");
    return;
  }

  try {
    // 1. Fetch the user's public IP address
    const ipResponse = await fetch("https://api.ipify.org?format=json");
    const { ip } = await ipResponse.json();

    // 2. Generate the detailed, human-readable description
    const description = generateLogDescription(event);

    // 3. Prepare the full payload for Firestore
    const firestorePayload = {
      userId,
      timestamp: serverTimestamp(),
      ip,
      description, // Save the description to Firestore as well
      ...event
    };

    // 4. Save the event to Firestore
    await addDoc(collection(db, "clickstream"), firestorePayload);

    // 5. Format and print the detailed log to the browser console
    const date = new Date();
    const formattedDate = `${date.toLocaleDateString()}, ${date.toLocaleTimeString()}`;
    const courseName = event.courseTitle || 'N/A';
    const eventName = event.analyticsId || 'Log report viewed'; // Fallback text

    const consoleMessage = `${formattedDate}\tCourse: ${courseName}\tLogs\t${eventName}\t${description}\tweb\t${ip}`;

    console.log(consoleMessage);

  } catch (err) {
    // Silently fail on IP fetch or logging errors in production
    // to not disrupt user experience.
    console.error("Clickstream logging failed:", err);
  }
};