import React from 'react';
import YouTube from 'react-youtube';
import { logEvent } from '../../utils/logEvent';

export default function VideoContent({ data, courseId, courseTitle, user }) {
  const opts = {
    height: '390',
    width: '100%',
    playerVars: {
      autoplay: 0,
    },
  };

  return (
      <div 
        data-analytics-id="video-player" 
        data-video-id={data.youtubeId}
        data-course-id={courseId}
        data-course-title={courseTitle} // Add this attribute
      >
          <YouTube videoId={data.youtubeId} opts={opts} />
      </div>
  );
}