import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyProfile } from "../../api/userApi";
import { getStreams } from "../../api/streamApi";
import useAuthStore from "../../state/authStore";
import { toast } from "sonner";
import { getImageUrl } from "../../utils/image";

const DashboardHome = () => {
  const [user, setUser] = useState(null);
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const loggedInUserId = useAuthStore((state) => state.userInfo?.id);

  useEffect(() => {
    const fetchData = async () => {
      if (!loggedInUserId) {
        setLoading(false);
        toast.error("Could not verify user. Please log in again.");
        return;
      }

      try {
        setLoading(true);
        const profileData = await getMyProfile();
        setUser(profileData); // The API returns the user object directly

        const streamsData = await getStreams({ userId: loggedInUserId });
        setStreams(streamsData.streams);
      } catch (error) {
        toast.error("Failed to fetch dashboard data.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [loggedInUserId]);

  if (loading) {
    return <div className="text-gray-300">Loading dashboard...</div>;
  }

  if (!user) {
    return <div className="text-gray-300">Could not load user profile.</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <img
            src={getImageUrl(user.avatarUrl)}
            alt={user.displayName}
            className="w-24 h-24 rounded-full"
          />
          <div>
            <h1 className="text-2xl font-bold text-white">
              {user.displayName}
            </h1>
            <p className="text-gray-300">{user.bio || "No bio provided."}</p>
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">My Streams</h2>
          <Link
            to="/dashboard/creator/create-stream"
            className="bg-gray-800 text-sky-400 py-2 px-4 rounded hover:bg-gray-700 transition-colors"
          >
            Create New Stream
          </Link>
        </div>
        {streams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {streams.map((stream) => (
              <div
                key={stream.id}
                className="bg-gray-800 p-4 rounded-lg shadow"
              >
                <img
                  src={getImageUrl(stream.thumbnailUrl)}
                  alt={stream.title}
                  className="w-full h-40 object-cover rounded-md mb-4"
                />
                <h3 className="text-xl font-semibold text-gray-100">
                  {stream.title}
                </h3>
                <p className="text-gray-300 capitalize">{stream.status}</p>
                <p className="mt-2 text-sm text-gray-300">
                  {stream.description}
                </p>
                <Link
                  to={`/dashboard/creator/stream-info/${stream.id}`}
                  className="mt-4 inline-block bg-transparent hover:bg-sky-500 text-sky-400 font-semibold hover:text-white py-2 px-4 border border-sky-500 hover:border-transparent rounded transition-colors"
                >
                  Edit Stream
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-300">You have not created any streams yet.</p>
        )}
      </div>
    </div>
  );
};

export default DashboardHome;
