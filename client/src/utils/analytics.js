import { logEvent } from './logEvent';

export const handleGlobalClick = (event, user, isAdmin) => {
  if (!user || !user.email || !user.uid) return; // Only track for logged-in users with valid data

  const targetElement = event.target.closest('[data-analytics-id]');
  if (!targetElement) return;
  
  const analyticsData = { ...targetElement.dataset };

  const eventPayload = {
    eventType: 'ui_click',
    pathname: window.location.pathname,
    userEmail: user.email, // Add the user's email for logging
    isAdmin: isAdmin, // Pass the admin status
    ...analyticsData,
    elementTag: targetElement.tagName,
    elementText: targetElement.textContent.trim().substring(0, 100)
  };

  logEvent(user.uid, eventPayload);
};