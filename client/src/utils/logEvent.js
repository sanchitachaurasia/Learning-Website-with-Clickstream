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
    case 'login_success':
      return `The user with email '${userEmail}' successfully logged in.`;
    case 'quiz-option-select':
      return `The user '${userId}' selected option '${event.optionText}' for question ${Number(event.questionIndex) + 1} in course '${courseTitle}'.`;

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
      return `The user '${userId}' submitted the quiz in course '${courseTitle}'.`;
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
  if (!userId) return;

  try {
    // 1. Fetch the user's public IP address
    const ipResponse = await fetch("https://api.ipify.org?format=json");
    const { ip } = await ipResponse.json();

    const firestorePayload = {
        Time: serverTimestamp(),
        "Event context": event.pathname || window.location.pathname,
        Component: event.component || 'N/A', // We can add data-component attribute later
        "Event name": event.analyticsId,
        Description: generateLogDescription(event, userId),
        Origin: 'web',
        "IP address": ip,
        Username: event.userEmail, // Using email as username
        "User Email": event.userEmail,
        "User Role": event.isAdmin ? 'Admin' : 'Learner', // We can add data-isAdmin later
        "Course Title": event.courseTitle || 'N/A',
        "Content Type": event.contentType || 'N/A', // We can add data-content-type later
        Action: event.eventType,
        Score: event.score || null,
        "Progress %": event.progressPercent || null,
        "Time Spent (seconds)": event.timeSpent || null,
        // Keep original data for debugging
        raw_event_data: event
    };

    await addDoc(collection(db, "clickstream"), firestorePayload);

    // Console logging can remain the same or be updated to use the new fields
    const date = new Date();
    const formattedDate = `${date.toLocaleDateString()}, ${date.toLocaleTimeString()}`;
    const consoleMessage = `${formattedDate}\tEvent: ${firestorePayload["Event name"]}\tDesc: ${firestorePayload.Description}\tIP: ${ip}`;
    
    console.log(consoleMessage);

  } catch (err) {
    // Silently fail on IP fetch or logging errors in production
    // to not disrupt user experience.
    console.error("Clickstream logging failed:", err);
  }
};