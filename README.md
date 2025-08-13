# LearnX - Full-Stack Learning Platform with Advanced Analytics

LearnX is a comprehensive, full-stack e-learning platform built with React and Firebase. It provides a complete ecosystem for online learning, featuring a user-facing application for students and a powerful, role-based administrative dashboard for content, user, and analytics management.

The application's core is its advanced clickstream tracking system, which logs every meaningful user interaction—from page navigation and video engagement to quiz submissions and administrative actions. This data is collected in a structured format, providing deep, actionable insights into learning patterns and platform usage.

**Live Demo:** https://assignment2-82dfb.web.app

**Demo Video:** [View on Google Drive](https://drive.google.com/file/d/1pFcsIQV89puJtIZckZ4od-X5A72jkcrd/view?usp=sharing)

---

## Features

### For Learners
* **Authentication:** Secure registration and login with persistent sessions.
* **Course Learning:** Browse courses, view dynamic content (text, video, quizzes), mark lessons as complete, and track overall progress with visual indicators.
* **Interactive Quizzes:** Take quizzes with multiple question types (multiple choice, text, number) and receive instant scoring.
* **Analytics Dashboard:** View personal learning statistics, including total time spent on courses, average quiz scores, and a log of recent activity.

### For Admins
* **Admin Dashboard:** A secure, role-based dashboard for system management.
* **Full User Management (CRUD):** View all registered users and promote or demote admin roles.
* **Full Course & Content Management (CRUD):** Create, read, update, and delete courses and their individual lessons or quiz questions.
* **Advanced Quiz Editor:** Dynamically add or remove questions and change question types on the fly.
* **System Analytics Dashboard:** Monitor system-wide statistics with charts and summary cards.
* **CSV Export:** Download the complete clickstream analytics data for external analysis.

---

## Technology Stack

* **Frontend:** React.js
* **Backend & Database:** Firebase (Firestore, Authentication, Hosting)
* **Styling:** Tailwind CSS
* **Routing:** React Router (`react-router-dom`)
* **State Management:** React Hooks & `react-firebase-hooks`
* **Key Libraries:**
  * `recharts` for data visualization
  * `papaparse` for CSV export
  * `react-youtube` for video playback

---

## Local Setup from Repository

To set up and run this project locally from the GitHub repository, follow these steps.

1. **Clone the Repository:**
   Open your terminal and clone the project from GitHub.
   ```bash
   git clone https://github.com/sanchitachaurasia/Learning-Website-with-Clickstream.git
    ```

2.  **Navigate to the Project Directory:**
    The React application is located in the `client` sub-directory.

    ```bash
    cd Learning-Website-with-Clickstream/client
    ```

3.  **Install Dependencies:**
    Install all the required npm packages.

    ```bash
    npm install
    ```

4.  **Set Up Firebase Credentials:**

      * Create a new project in the [Firebase Console](https://console.firebase.google.com/).
      * Enable **Authentication** (with the Email/Password provider), **Firestore Database**, and **Hosting**.
      * In your project's `client` directory, create a new file named `.env.local`.
      * Copy your Firebase project's web app configuration keys into this file. It should look like this:
        ```env
        REACT_APP_FIREBASE_API_KEY="YOUR_API_KEY"
        REACT_APP_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN"
        REACT_APP_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
        REACT_APP_FIREBASE_STORAGE_BUCKET="YOUR_STORAGE_BUCKET"
        REACT_APP_FIREBASE_MESSAGING_SENDER_ID="YOUR_SENDER_ID"
        REACT_APP_FIREBASE_APP_ID="YOUR_APP_ID"
        ```

5.  **Start the Development Server:**

    ```bash
    npm start
    ```

    The application will now be running on `http://localhost:3000`.

-----

## Git Repository Description

A full-stack e-learning platform built with React and Firebase, featuring a complete admin dashboard, user analytics, and a comprehensive clickstream tracking system for detailed learning analytics.

-----

## Firestore Data Structure

The database is structured into four main collections:

  * **`courses`**: Stores course details and a sub-collection for its content.
  * **`users`**: Stores user-specific data like registered courses and progress.
  * **`admins`**: A simple collection where document IDs are the UIDs of admin users, used for role management.
  * **`clickstream`**: Stores all logged user interaction events in a detailed, structured format.

-----

## Clickstream Analytics Implementation

The analytics system uses a hybrid approach for optimal data collection:

1.  **Global Event Listener:** A single listener in `App.js` captures all general UI clicks on elements tagged with a `data-analytics-id` attribute. This is efficient for tracking navigation and simple interactions.
2.  **Manual Event Logging:** For complex, state-dependent events, logging is done manually within the component. This is crucial for capturing:
      * **Time Spent:** Calculated in the `VideoContent` component by tracking play and pause timestamps.
      * **Quiz Scores:** Logged in the `QuizComponent`'s `handleSubmit` function to include the final score and total questions.
      * **Successful Logins/Registrations:** Logged after the asynchronous Firebase authentication call succeeds.

This hybrid model ensures that all required data is captured accurately and efficiently without compromising on detail.