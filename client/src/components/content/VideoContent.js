import React from 'react';
import YouTube from 'react-youtube';

export default function VideoContent({ data }) {
  const opts = {
    height: '390',
    width: '100%', // Make it responsive
    playerVars: {
      autoplay: 0,
    },
  };

  return <YouTube videoId={data.youtubeId} opts={opts} />;
}