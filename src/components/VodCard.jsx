/* eslint-disable react/prop-types */
import React from "react";
import { Link } from "react-router-dom";
import { getImageUrl } from "../utils/image";

const VodCard = ({ data }) => {
  if (!data) {
    return null;
  }

  const { id, title, thumbnailUrl, user, category, viewCount } = data;
  const linkUrl = `/vods/${id}`;
  console.log("user.avatarUrl in vod card", user.avatarUrl);
  return (
    <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-200 flex flex-col h-full">
      <Link to={linkUrl} className="relative">
        <img
          src={getImageUrl(thumbnailUrl)}
          alt={title}
          className="w-full h-40 object-cover"
        />
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
          {viewCount?.toLocaleString() || 0} views
        </div>
      </Link>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-start mt-2">
          <Link to={`/channel/${user.username}`} className="flex-shrink-0">
            <img
              src={getImageUrl(user.avatarUrl)}
              alt={user.username}
              className="w-10 h-10 rounded-full mr-3 object-cover"
            />
          </Link>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-100 truncate">
              <Link to={linkUrl} className="text-sky-400 hover:text-sky-300">
                {title}
              </Link>
            </h3>
            <Link
              to={`/channel/${user.username}`}
              className="text-sm text-gray-300 hover:text-white block truncate"
            >
              {user.displayName || user.username}
            </Link>
          </div>
        </div>
        {category && (
          <div className="mt-auto pt-2">
            <Link to={`/categories/${category.slug}`}>
              <span className="text-xs bg-gray-700 text-sky-400 px-2 py-1 rounded-full hover:bg-gray-600 hover:text-sky-300">
                {category.name}
              </span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VodCard;
