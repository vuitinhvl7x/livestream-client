/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";

const StreamCard = ({ data, type }) => {
  const [vod, setVod] = useState(null);
  const [isLoading, setIsLoading] = useState(type === "stream");

  useEffect(() => {
    let isMounted = true;
    // We still check for a VOD for any card of type "stream" to decide
    // if we should display it as a VOD card or an ended-stream card.
    if (type === "stream" && data?.id) {
      setIsLoading(true);
      api
        .get(`/streams/${data.id}/vod`)
        .then((response) => {
          if (isMounted && response.data.success) {
            setVod(response.data.vod);
          }
        })
        .catch((error) => {
          // If the error is a 404, it just means no VOD exists. This is an
          // expected case, so we don't need to log it as an error.
          if (error.response && error.response.status === 404) {
            if (isMounted) {
              setVod(null);
            }
          } else {
            // For any other errors (e.g., server issues), we still log them.
            console.error("Error checking for VOD:", error);
            if (isMounted) {
              setVod(null);
            }
          }
        })
        .finally(() => {
          if (isMounted) {
            setIsLoading(false);
          }
        });
    } else {
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [data, type]);

  if (!data) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col h-full animate-pulse">
        <div className="w-full h-40 bg-gray-700"></div>
        <div className="p-4 flex flex-col flex-grow">
          <div className="flex items-start mt-2">
            <div className="w-10 h-10 rounded-full mr-3 bg-gray-700"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
          <div className="mt-auto pt-2">
            <div className="h-4 bg-gray-700 rounded-full w-1/4"></div>
          </div>
        </div>
      </div>
    );
  }

  // The primary source of truth for "live" status is now `data.status`.
  const isLive = type === "stream" && data.status === "live";
  const hasVod = vod !== null;
  const isEndedWithoutVod = type === "stream" && !isLive && !hasVod;

  // Case: Stream has ended and no VOD is available.
  // We render a disabled card to inform the user.
  if (isEndedWithoutVod) {
    const { title, thumbnailUrl, user, category } = data;
    return (
      <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col h-full relative cursor-not-allowed group">
        <div className="relative">
          <img
            src={
              thumbnailUrl ||
              `https://fakeimg.pl/440x248/282828/eae0d0?text=Stream+Ended`
            }
            alt={title}
            className="w-full h-40 object-cover filter grayscale"
          />
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100">
            <p className="text-white font-semibold text-center px-4">
              Video không có sẵn
            </p>
          </div>
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <div className="flex items-start mt-2">
            <img
              src={
                user.avatarUrl ||
                `https://fakeimg.pl/40/282828/eae0d0?text=${user.username
                  .charAt(0)
                  .toUpperCase()}`
              }
              alt={user.username}
              className="w-10 h-10 rounded-full mr-3"
            />
            <div className="flex-1">
              <h3 className="text-md font-bold truncate text-gray-500">
                {title}
              </h3>
              <p className="text-sm text-gray-400 block truncate">
                {user.displayName || user.username}
              </p>
            </div>
          </div>
          {category && (
            <div className="mt-auto pt-2">
              <span className="text-xs bg-gray-700 text-gray-500 px-2 py-1 rounded-full">
                {category.name}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // If a VOD was found for an ended stream, we display the VOD data.
  // Otherwise, we display the original stream/VOD data.
  const displayData = type === "stream" && hasVod ? vod : data;

  const linkUrl = isLive
    ? `/streams/${displayData.id}`
    : `/vods/${displayData.id}`;
  const viewCount = isLive ? displayData.viewerCount : displayData.viewCount;
  const countText = isLive ? "viewers" : "views";

  const { title, thumbnailUrl, user, category } = displayData;

  return (
    <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-200 flex flex-col h-full">
      <Link to={linkUrl} className="relative">
        <img
          src={
            thumbnailUrl ||
            `https://fakeimg.pl/440x248/282828/eae0d0?text=${
              isLive ? "Stream" : "Video"
            }`
          }
          alt={title}
          className="w-full h-40 object-cover"
        />
        {isLive && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md">
            LIVE
          </div>
        )}
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
          {viewCount?.toLocaleString() || 0} {countText}
        </div>
      </Link>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-start mt-2">
          <Link to={`/channel/${user.username}`}>
            <img
              src={
                user.avatarUrl ||
                `https://fakeimg.pl/40/282828/eae0d0?text=${user.username
                  .charAt(0)
                  .toUpperCase()}`
              }
              alt={user.username}
              className="w-10 h-10 rounded-full mr-3"
            />
          </Link>
          <div className="flex-1">
            <h3 className="text-md font-bold truncate">
              <Link to={linkUrl} className="hover:text-purple-400">
                {title}
              </Link>
            </h3>
            <Link
              to={`/channel/${user.username}`}
              className="text-sm text-gray-400 hover:text-white block truncate"
            >
              {user.displayName || user.username}
            </Link>
          </div>
        </div>
        {category && (
          <div className="mt-auto pt-2">
            <Link to={category.slug ? `/categories/${category.slug}` : "#"}>
              <span className="text-xs bg-gray-700 text-purple-400 px-2 py-1 rounded-full hover:bg-gray-600">
                {category.name}
              </span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default StreamCard;
