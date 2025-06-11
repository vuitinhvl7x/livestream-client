import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import StreamCard from "../components/StreamCard";
import VodCard from "../components/VodCard";
import useAuthStore from "../state/authStore";
import {
  getUserProfile,
  followUser,
  unfollowUser,
  getFollowing,
} from "../api/userApi";
import { getStreams } from "../api/streamApi";
import { getVodsByUserId } from "../api/vodApi";
import { getImageUrl } from "../utils/image";

const Channel = () => {
  const { username } = useParams();
  const currentUser = useAuthStore((state) => state.userInfo);
  const [profile, setProfile] = useState(null);
  const [streams, setStreams] = useState([]);
  const [vods, setVods] = useState([]);
  const [totalVideoCount, setTotalVideoCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("streams");
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        setLoading(true);
        setError(null);
        setProfile(null);
        setIsFollowing(false);
        setStreams([]);
        setVods([]);
        setTotalVideoCount(0);

        // 1. Fetch user profile
        const userProfile = await getUserProfile(username);
        setProfile(userProfile);

        // Check if the current logged-in user is following this channel user
        if (currentUser && userProfile && currentUser.id !== userProfile.id) {
          const followingData = await getFollowing(currentUser.id, 1, 9999);
          if (followingData && followingData.following) {
            const isUserFollowing = followingData.following.some(
              (followedUser) => followedUser.id === userProfile.id
            );
            setIsFollowing(isUserFollowing);
          }
        }

        // 2. Fetch streams and VODs for that user
        const userId = userProfile.id;
        const [streamsResponse, vodsResponse] = await Promise.all([
          getStreams({ userId, limit: 50 }),
          getVodsByUserId(userId, 50),
        ]);

        const allVods = vodsResponse.data || [];
        const uploadedVods = allVods.filter((vod) => vod.streamId === null);

        setStreams(streamsResponse.streams || []);
        setVods(uploadedVods);
        setTotalVideoCount(allVods.length);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setError("User not found.");
        } else {
          setError("Failed to fetch channel data.");
        }
        console.error("Error fetching channel data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchChannelData();
    }
  }, [username, currentUser]);

  const handleFollowToggle = async () => {
    if (!currentUser) {
      alert("Vui lòng đăng nhập để thực hiện chức năng này.");
      return;
    }
    if (currentUser.id === profile.id) return; // Không thể tự theo dõi

    setIsFollowLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(profile.id);
        setProfile((p) => ({ ...p, followerCount: p.followerCount - 1 }));
      } else {
        await followUser(profile.id);
        setProfile((p) => ({ ...p, followerCount: p.followerCount + 1 }));
      }
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái theo dõi:", err);
      alert("Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsFollowLoading(false);
    }
  };

  const itemsToDisplay = activeTab === "streams" ? streams : vods;

  const tabClasses = (tabName) =>
    `px-4 py-2 text-lg font-semibold border-b-4 transition-colors duration-200 ${
      activeTab === tabName
        ? "border-sky-500 text-white"
        : "border-transparent text-gray-300 hover:text-white"
    }`;

  if (loading) {
    return (
      <div className="text-center mt-10 text-gray-300">Loading channel...</div>
    );
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  if (!profile) {
    return (
      <div className="text-center mt-10 text-gray-300">
        This channel does not exist.
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start bg-gray-800 p-6 rounded-lg mb-8">
        <img
          src={getImageUrl(profile.avatarUrl)}
          alt={profile.displayName}
          className="w-32 h-32 sm:w-36 sm:h-36 rounded-full border-4 border-sky-500 object-cover"
        />
        <div className="sm:ml-6 mt-4 sm:mt-0 text-center sm:text-left flex-grow">
          <h1 className="text-2xl font-bold text-white">
            {profile.displayName || profile.username}
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-2 justify-center sm:justify-start text-gray-300">
            <span>@{profile.username}</span>
            <span className="hidden sm:inline">·</span>
            <span>
              <span className="font-bold text-white">
                {profile.followerCount}
              </span>{" "}
              Followers
            </span>
            <span className="hidden sm:inline">·</span>
            <span>
              <span className="font-bold text-white">{totalVideoCount}</span>{" "}
              videos
            </span>
          </div>
          <p className="mt-4 text-gray-300 max-w-xl">{profile.bio}</p>
        </div>
        {/* Nút Theo dõi / Bỏ theo dõi */}
        {currentUser && profile && currentUser.id !== profile.id && (
          <div className="mt-6 sm:mt-0 sm:ml-6 flex-shrink-0">
            <button
              onClick={handleFollowToggle}
              disabled={isFollowLoading}
              className={`px-6 py-2 rounded-md font-semibold text-white transition-colors duration-200 w-40 text-center ${
                isFollowing
                  ? "bg-gray-600 hover:bg-gray-500"
                  : "bg-sky-600 hover:bg-sky-700"
              } ${isFollowLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isFollowLoading
                ? "..."
                : isFollowing
                ? "Bỏ theo dõi"
                : "Theo dõi"}
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab("streams")}
          className={tabClasses("streams")}
        >
          Streams <span className="text-gray-300 ml-1">({streams.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("videos")}
          className={tabClasses("videos")}
        >
          Videos <span className="text-gray-300 ml-1">({vods.length})</span>
        </button>
      </div>

      {/* Content Grid */}
      {itemsToDisplay.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {itemsToDisplay.map((item) => {
            if (activeTab === "streams") {
              return <StreamCard key={item.id} data={item} type="stream" />;
            }
            return <VodCard key={item.id} data={item} />;
          })}
        </div>
      ) : (
        <div className="text-center mt-16 text-gray-300">
          <h3 className="text-xl font-semibold text-gray-100">
            {activeTab === "streams" ? "No live content" : "No videos"}
          </h3>
          <p className="mt-2">
            This user has no{" "}
            {activeTab === "streams" ? "live streams" : "videos"} available.
          </p>
        </div>
      )}
    </div>
  );
};

export default Channel;
