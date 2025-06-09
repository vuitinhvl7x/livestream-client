import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFollowing } from "../../api/userApi";
import useAuthStore from "../../state/authStore";
import { toast } from "sonner";

const MyFollowingList = () => {
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const userId = useAuthStore((state) => state.userInfo?.id);

  useEffect(() => {
    if (!userId) return;

    const fetchFollowing = async () => {
      try {
        setLoading(true);
        const data = await getFollowing(userId, page);
        setFollowing(data.following);
        setTotalPages(data.totalPages);
      } catch (error) {
        toast.error("Failed to load following list.");
      } finally {
        setLoading(false);
      }
    };

    fetchFollowing();
  }, [userId, page]);

  if (loading) return <div>Loading following list...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Channels I Follow</h1>
      {following.length > 0 ? (
        <div className="space-y-4">
          {following.map((user) => (
            <div
              key={user.id}
              className="flex items-center bg-white p-4 rounded-lg shadow"
            >
              <img
                src={user.avatarUrl}
                alt={user.username}
                className="w-12 h-12 rounded-full mr-4"
              />
              <Link
                to={`/channel/${user.username}`}
                className="text-lg font-semibold text-indigo-600 hover:underline"
              >
                {user.username}
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p>You are not following any channels yet.</p>
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

export default MyFollowingList;
