import { logEvent } from './logEvent';

/**
 * This is the global click handler. It finds the closest element with a
 * 'data-analytics-id' attribute and logs a structured event.
 * @param {MouseEvent} event - The native browser click event.
 * @param {string|null} userId - The UID of the current user.
 */
export const handleGlobalClick = (event, userId) => {
  if (!userId) return; // Only track for logged-in users

  // Use .closest() to find the nearest parent element that we want to track
  const targetElement = event.target.closest('[data-analytics-id]');

  // If no relevant element was clicked, do nothing
  if (!targetElement) {
    return;
  }

  // Extract all 'data-*' attributes from the element.
  // This turns data-analytics-id="logout-button" into { analyticsId: 'logout-button' }
  const analyticsData = { ...targetElement.dataset };

  const eventPayload = {
    eventType: 'ui_click', // A generic type for all tracked clicks
    pathname: window.location.pathname, // Where the click happened
    ...analyticsData, // Add all our custom data attributes
    elementTag: targetElement.tagName,
    elementText: targetElement.textContent.trim().substring(0, 100) // Get the text of the element
  };

  logEvent(userId, eventPayload);
};