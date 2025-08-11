import React from 'react';
import YouTube from 'react-youtube';
import { logEvent } from '../../utils/logEvent'; // Import the logger

export default function VideoContent({ data, courseId, user }) { // Accept new props
  const handlePlay = () => {
    if (user) {
      logEvent(user.uid, {
        eventType: 'video_play',
        courseId: courseId,
        contentId: data.id, // Assuming data object has an id
        videoTitle: data.title
      });
    }
  };
  // ... opts object ...
  return <YouTube videoId={data.youtubeId} opts={opts} onPlay={handlePlay} />;
}