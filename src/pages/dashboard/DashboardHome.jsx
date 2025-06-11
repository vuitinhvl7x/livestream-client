import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyProfile } from "../../api/userApi";
import { getStreams } from "../../api/streamApi";
import { getVodsByUserId, deleteVOD } from "../../api/vodApi";
import useAuthStore from "../../state/authStore";
import { toast } from "sonner";
import { getImageUrl } from "../../utils/image";
import UploadVODModal from "../../components/vod/UploadVODModal";

const DashboardHome = () => {
  const [user, setUser] = useState(null);
  const [streams, setStreams] = useState([]);
  const [vods, setVods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("streams");
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [vodFilter, setVodFilter] = useState("all");

  const loggedInUserId = useAuthStore((state) => state.userInfo?.id);

  const fetchData = async () => {
    if (!loggedInUserId) {
      toast.error("Could not verify user. Please log in again.");
      return;
    }
    try {
      setLoading(true);
      const profileData = await getMyProfile();
      setUser(profileData);

      const streamsData = await getStreams({ userId: loggedInUserId });
      setStreams(streamsData.streams || []);

      const vodsData = await getVodsByUserId(loggedInUserId);
      setVods(vodsData.data || []);
    } catch (error) {
      toast.error("Failed to fetch dashboard data.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [loggedInUserId]);

  const handleDeleteVod = async (vodId) => {
    if (window.confirm("Are you sure you want to delete this VOD?")) {
      try {
        await deleteVOD(vodId);
        setVods(vods.filter((vod) => vod.id !== vodId));
        toast.success("VOD deleted successfully.");
      } catch (error) {
        toast.error("Failed to delete VOD.");
        console.error(error);
      }
    }
  };

  if (loading) {
    return <div className="text-gray-300">Loading dashboard...</div>;
  }

  if (!user) {
    return <div className="text-gray-300">Could not load user profile.</div>;
  }

  const filteredVods = vods.filter((vod) => {
    if (vodFilter === "local") {
      return !vod.streamId;
    }
    if (vodFilter === "stream") {
      return !!vod.streamId;
    }
    return true;
  });

  return (
    <div>
      <UploadVODModal
        isOpen={isUploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadSuccess={fetchData}
      />
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

      <div className="flex border-b border-gray-700 mb-4">
        <button
          className={`py-2 px-4 text-lg font-medium ${
            activeTab === "streams"
              ? "text-sky-400 border-b-2 border-sky-400"
              : "text-gray-400 hover:text-white"
          }`}
          onClick={() => setActiveTab("streams")}
        >
          My Streams
        </button>
        <button
          className={`py-2 px-4 text-lg font-medium ${
            activeTab === "videos"
              ? "text-sky-400 border-b-2 border-sky-400"
              : "text-gray-400 hover:text-white"
          }`}
          onClick={() => setActiveTab("videos")}
        >
          My Videos
        </button>
      </div>

      {activeTab === "streams" && (
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
            <p className="text-gray-300">
              You have not created any streams yet.
            </p>
          )}
        </div>
      )}

      {activeTab === "videos" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">My Videos (VODs)</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 rounded-lg p-1 bg-gray-900">
                <button
                  onClick={() => setVodFilter("all")}
                  className={`px-3 py-1 text-sm font-medium rounded-md ${
                    vodFilter === "all"
                      ? "bg-sky-500 text-white"
                      : "text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setVodFilter("local")}
                  className={`px-3 py-1 text-sm font-medium rounded-md ${
                    vodFilter === "local"
                      ? "bg-sky-500 text-white"
                      : "text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  From Local
                </button>
                <button
                  onClick={() => setVodFilter("stream")}
                  className={`px-3 py-1 text-sm font-medium rounded-md ${
                    vodFilter === "stream"
                      ? "bg-sky-500 text-white"
                      : "text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  From Stream
                </button>
              </div>
              <button
                onClick={() => setUploadModalOpen(true)}
                className="bg-gray-800 text-sky-400 py-2 px-4 rounded hover:bg-gray-700 transition-colors"
              >
                Upload New VOD
              </button>
            </div>
          </div>
          {filteredVods.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVods.map((vod) => (
                <div
                  key={vod.id}
                  className="bg-gray-800 p-4 rounded-lg shadow relative"
                >
                  <img
                    src={getImageUrl(vod.thumbnailUrl)}
                    alt={vod.title}
                    className="w-full h-40 object-cover rounded-md mb-4"
                  />
                  {vod.streamId && (
                    <span className="absolute top-2 right-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded">
                      From Stream
                    </span>
                  )}
                  <h3 className="text-xl font-semibold text-gray-100">
                    {vod.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-300">
                    {vod.description}
                  </p>
                  <div className="mt-4">
                    <button
                      onClick={() => handleDeleteVod(vod.id)}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-300">
              No VODs found for the selected filter.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardHome;
