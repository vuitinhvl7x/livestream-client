import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFollowing } from "../api/userApi";
import useAuthStore from "../state/authStore";

const Sidebar = () => {
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = useAuthStore((state) => state.userInfo?.id);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!userId || !isAuthenticated) {
      setLoading(false);
      return;
    }

    const fetchFollowing = async () => {
      try {
        setLoading(true);
        const data = await getFollowing(userId, 1);
        setFollowing(data.following);
      } catch (error) {
        console.error("Failed to load following list for sidebar.");
      } finally {
        setLoading(false);
      }
    };

    fetchFollowing();
  }, [userId, isAuthenticated]);

  return (
    <div className="p-2">
      <h2 className="text-sm font-bold mb-2 uppercase tracking-wider text-gray-400 px-2">
        Followed Channels
      </h2>
      {!isAuthenticated ? (
        <div className="px-2">
          <p className="text-sm text-gray-400">
            <Link
              to="/account/login"
              className="text-indigo-400 hover:underline"
            >
              Log in
            </Link>{" "}
            to see channels you follow.
          </p>
        </div>
      ) : loading ? (
        <div className="px-2 text-gray-400">Loading...</div>
      ) : following.length > 0 ? (
        <ul className="space-y-1">
          {following.map((user) => (
            <li key={user.id}>
              <Link
                to={`/channel/${user.username}`}
                className="flex items-center p-2 rounded hover:bg-gray-700"
              >
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="w-8 h-8 rounded-full mr-3"
                />
                <span className="text-gray-300 font-semibold">
                  {user.username}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-400 px-2">
          You are not following any channels yet.
        </p>
      )}
    </div>
  );
};

export default Sidebar;
