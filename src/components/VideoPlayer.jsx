/* eslint-disable react/prop-types */
import React, { useEffect, useRef } from "react";
import Hls from "hls.js";
import dashjs from "dashjs";

const VideoPlayer = ({ src }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    // Determine the actual stream URL from the src prop
    let streamUrl = null;
    if (typeof src === "string") {
      streamUrl = src;
    } else if (typeof src === "object" && src !== null) {
      // Prefer HLS for wider compatibility, fallback to DASH
      if (src.hls) {
        streamUrl = src.hls;
        console.log("HLS stream selected:", streamUrl);
      } else if (src.dash) {
        streamUrl = src.dash;
        console.log("DASH stream selected:", streamUrl);
      }
    }

    if (!streamUrl) {
      console.log("No valid video source URL found in src prop:", src);
      return;
    }

    console.log("Attempting to play video with src:", streamUrl);

    let hls = null;
    let player = null;

    const cleanup = () => {
      if (hls) {
        hls.destroy();
      }
      if (player) {
        player.reset();
      }
    };

    cleanup(); // Clean up previous instances

    try {
      if (streamUrl.endsWith(".m3u8")) {
        if (Hls.isSupported()) {
          console.log("Using HLS.js for .m3u8 stream");
          hls = new Hls();
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            video
              .play()
              .catch((e) => console.error("HLS.js autoplay prevented", e));
          });
          hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
              console.error(`HLS.js fatal error: ${data.type}`, data);
            } else {
              console.warn(`HLS.js non-fatal error: ${data.type}`, data);
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          console.log("Using native HLS support for .m3u8 stream");
          video.src = streamUrl;
          video.addEventListener("loadedmetadata", () => {
            video
              .play()
              .catch((e) => console.error("Native HLS autoplay prevented", e));
          });
        } else {
          console.error("HLS not supported");
        }
      } else if (streamUrl.endsWith(".mpd")) {
        console.log("Using dash.js for .mpd stream");
        player = dashjs.MediaPlayer().create();
        player.initialize(video, streamUrl, true); // true for autoplay
        player.on(dashjs.MediaPlayer.events.ERROR, (e) => {
          console.error("Dash.js error:", e);
        });
      } else {
        console.log("Using native video support for other formats");
        video.src = streamUrl;
        video.autoplay = true;
        video.addEventListener("error", (e) => {
          console.error("Native video player error", e);
        });
      }
    } catch (error) {
      console.error("Error setting up video player:", error);
    }

    return () => {
      cleanup();
    };
  }, [src]);

  return (
    <div className="bg-black aspect-video">
      {src ? (
        <video
          ref={videoRef}
          controls
          autoPlay
          muted
          playsInline
          className="w-full h-full"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
          <p>Video feed is not available.</p>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
