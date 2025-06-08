/* eslint-disable react/prop-types */
import React from "react";
import { Link } from "react-router-dom";

const StreamCard = ({ data, type }) => {
  if (!data) {
    return null;
  }

  // Normalize data from either a stream or a VOD object
  const isLive = type === "stream";
  const linkUrl = isLive ? `/streams/${data.id}` : `/vods/${data.id}`; // Assuming a /vods/:id route for VOD details
  const viewCount = isLive ? data.viewerCount : data.viewCount;
  const countText = isLive ? "viewers" : "views";

  const { id, title, thumbnailUrl, user, category } = data;

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
            <Link to={`/categories/${category.slug}`}>
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
