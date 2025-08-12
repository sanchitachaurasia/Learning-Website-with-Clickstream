import React, { useRef } from 'react';
import YouTube from 'react-youtube';
import { logEvent } from '../../utils/logEvent';

export default function VideoContent({ data, courseId, courseTitle, user }) {
  // Use a ref to hold the start time to prevent re-renders
  const playStartTime = useRef(null);

  const opts = {
    height: '390',
    width: '100%',
    playerVars: { autoplay: 0 },
  };

  const handlePlay = () => {
    // Record the time when the video starts playing
    playStartTime.current = new Date();
    if (user) {
      logEvent(user.uid, {
        eventType: 'video_interaction',
        analyticsId: 'video_play',
        userEmail: user.email,
        courseId,
        courseTitle,
        contentId: data.id,
        contentType: 'video',
      });
    }
  };

  const handlePauseOrEnd = () => {
    if (!user || !playStartTime.current) return;

    // Calculate the time spent in seconds
    const timeSpent = (new Date() - playStartTime.current) / 1000;
    playStartTime.current = null; // Reset the start time

    logEvent(user.uid, {
      eventType: 'video_interaction',
      analyticsId: 'video_pause',
      userEmail: user.email,
      courseId,
      courseTitle,
      contentId: data.id,
      contentType: 'video',
      timeSpent: timeSpent,
    });
  };

  return (
    <div data-analytics-id="video-player-wrapper">
      <YouTube 
        videoId={data.youtubeId} 
        opts={opts} 
        onPlay={handlePlay} 
        onPause={handlePauseOrEnd}
        onEnd={handlePauseOrEnd}
      />
    </div>
  );
}