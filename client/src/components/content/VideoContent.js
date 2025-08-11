import React from 'react';
import YouTube from 'react-youtube';
import { logEvent } from '../../utils/logEvent';

export default function VideoContent({ data, courseId, user }) {
  const opts = {
    height: '390',
    width: '100%',
    playerVars: {
      autoplay: 0,
    },
  };

  const handlePlay = () => {
    if (user) {
      logEvent(user.uid, {
        eventType: 'video_play',
        courseId: courseId,
        contentId: data.id,
        videoTitle: data.title
      });
    }
  };

  return <YouTube videoId={data.youtubeId} opts={opts} onPlay={handlePlay} />;
}