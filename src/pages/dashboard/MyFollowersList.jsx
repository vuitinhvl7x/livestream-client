import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFollowers } from "../../api/userApi";
import useAuthStore from "../../state/authStore";
import { toast } from "sonner";

const MyFollowersList = () => {
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const userId = useAuthStore((state) => state.userInfo?.id);

  useEffect(() => {
    console.log("userId in my followers list", userId);
    if (!userId) return;

    const fetchFollowers = async () => {
      try {
        setLoading(true);
        const data = await getFollowers(userId, page);
        setFollowers(data.followers);
        setTotalPages(data.totalPages);
      } catch (error) {
        toast.error("Failed to load followers.");
      } finally {
        setLoading(false);
      }
    };

    fetchFollowers();
  }, [userId, page]);

  if (loading) return <div>Loading followers...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Followers</h1>
      {followers.length > 0 ? (
        <div className="space-y-4">
          {followers.map((follower) => (
            <div
              key={follower.id}
              className="flex items-center bg-white p-4 rounded-lg shadow"
            >
              <img
                src={follower.avatarUrl}
                alt={follower.username}
                className="w-12 h-12 rounded-full mr-4"
              />
              <Link
                to={`/channel/${follower.username}`}
                className="text-lg font-semibold text-indigo-600 hover:underline"
              >
                {follower.username}
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p>You don't have any followers yet.</p>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center items-center space-x-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default MyFollowersList;
