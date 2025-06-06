/* eslint-disable react/prop-types */
import React from "react";

const VideoPlayer = ({ src }) => {
  return (
    <div className="bg-black aspect-video">
      {src ? (
        <video controls autoPlay className="w-full h-full">
          <source src={src} type="application/x-mpegURL" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
          <p>Video feed is not available.</p>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
