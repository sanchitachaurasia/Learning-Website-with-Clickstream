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
    case 'register_success':
      return `The user with email '${userEmail}' successfully registered.`;
    case 'quiz-option-select':
      return `The user '${userId}' selected option '${event.optionText}' for question ${Number(event.questionIndex) + 1} in course '${courseTitle}'.`;

    // Navigation events
    case 'nav-dashboard':
      return `The user '${userId}' navigated to the Dashboard.`;
    case 'nav-all-courses':
      return `The user '${userId}' navigated to the All Courses page.`;
    case 'nav-my-analytics':
      return `The user '${userId}' navigated to their Analytics page.`;
    case 'nav-admin':
      return `The admin user '${userId}' navigated to the Admin Dashboard.`;
    case 'nav-brand-logo':
      return `The user '${userId}' clicked on the brand logo.`;
    case 'logout-button':
      return `The user '${userId}' clicked the logout button.`;

    // Course interaction events
    case 'dashboard-course-card':
      return `The user '${userId}' viewed the course '${courseTitle}' from their dashboard.`;
    case 'explore-courses-link':
      return `The user '${userId}' clicked the 'Explore Courses' link from the dashboard.`;
    case 'course-register-button':
      return `The user '${userId}' registered for the course '${courseTitle}'.`;
    case 'course-deregister-button':
      return `The user '${userId}' deregistered from the course '${courseTitle}'.`;
    case 'completion-button':
      return `The user '${userId}' marked content in course '${courseTitle}' as ${event.completedStatus === 'true' ? 'incomplete' : 'complete'}.`;
    case 'quiz-submit-button':
      return `The user '${userId}' submitted the quiz in course '${courseTitle}'.`;

    // Video events
    case 'video-player':
      return `The user '${userId}' interacted with a video player in course '${courseTitle}'.`;

    // Admin navigation events
    case 'admin-manage-courses':
      return `The admin user '${userId}' navigated to Manage Courses.`;
    case 'admin-manage-users':
      return `The admin user '${userId}' navigated to Manage Users.`;
    case 'admin-view-analytics':
      return `The admin user '${userId}' navigated to View Analytics.`;

    // Admin management actions
    case 'admin-create-course-link':
      return `The admin user '${userId}' clicked to create a new course.`;
    case 'admin-edit-course-link':
      return `The admin user '${userId}' clicked to edit course '${courseTitle}'.`;
    case 'admin-delete-course-button':
      return `The admin user '${userId}' deleted the course '${courseTitle}'.`;
    case 'admin-manage-content-link':
      return `The admin user '${userId}' clicked to manage content for course '${courseTitle}'.`;
    case 'admin-delete-content-button':
      return `The admin user '${userId}' deleted content in course '${courseTitle}'.`;
    case 'admin-toggle-user-role':
      return `The admin user '${userId}' toggled admin role for user '${event.targetUserEmail}'.`;
    case 'admin-export-csv':
      return `The admin user '${userId}' exported analytics data to CSV.`;

    // Form submissions
    case 'login-form-submit':
      return `The user '${userId}' submitted the login form.`;
    case 'register-form-submit':
      return `The user '${userId}' submitted the registration form.`;
    case 'create-course-form-submit':
      return `The admin user '${userId}' submitted the create course form.`;
    case 'edit-course-form-submit':
      return `The admin user '${userId}' submitted the edit course form for '${courseTitle}'.`;
    case 'edit-quiz-form-submit':
      return `The admin user '${userId}' submitted the edit quiz form for course '${courseTitle}'.`;

    // Quiz management
    case 'quiz-add-question':
      return `The admin user '${userId}' added a question to the quiz in course '${courseTitle}'.`;
    case 'quiz-remove-question':
      return `The admin user '${userId}' removed a question from the quiz in course '${courseTitle}'.`;

    // Auth links
    case 'auth-register-link':
      return `The user clicked the 'Register here' link from the login page.`;
    case 'auth-login-link':
      return `The user clicked the 'Login here' link from the register page.`;

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