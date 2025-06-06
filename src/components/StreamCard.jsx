/* eslint-disable react/prop-types */
import React from "react";
import { Link } from "react-router-dom";

const StreamCard = ({ stream }) => {
  if (!stream) {
    return null;
  }

  const { id, title, viewerCount, thumbnailUrl, user, category } = stream;

  return (
    <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-200">
      <Link to={`/streams/${id}`}>
        <img
          src={
            thumbnailUrl ||
            `https://fakeimg.pl/440x248/282828/eae0d0?text=Stream`
          }
          alt={title}
          className="w-full h-40 object-cover"
        />
      </Link>
      <div className="p-4">
        <h3 className="text-lg font-bold truncate">
          <Link to={`/streams/${id}`} className="hover:text-purple-400">
            {title}
          </Link>
        </h3>
        <div className="flex items-center mt-2">
          <Link to={`/channel/${user.username}`} className="flex items-center">
            <img
              src={
                user.avatarUrl ||
                `https://fakeimg.pl/40/282828/eae0d0?text=${user.username
                  .charAt(0)
                  .toUpperCase()}`
              }
              alt={user.username}
              className="w-8 h-8 rounded-full mr-2"
            />
            <span className="text-sm text-gray-400 hover:text-white">
              {user.username}
            </span>
          </Link>
        </div>
        {category && (
          <div className="mt-2">
            <Link to={`/categories/${category.slug}`}>
              <span className="text-xs bg-gray-700 text-purple-400 px-2 py-1 rounded-full hover:bg-gray-600">
                {category.name}
              </span>
            </Link>
          </div>
        )}
        <div className="mt-2 text-sm text-gray-400">{viewerCount} viewers</div>
      </div>
    </div>
  );
};

export default StreamCard;
