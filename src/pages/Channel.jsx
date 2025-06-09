import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import StreamCard from "../components/StreamCard";
import VodCard from "../components/VodCard";

const Channel = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [streams, setStreams] = useState([]);
  const [vods, setVods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("live");

  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        setLoading(true);
        setError(null);
        setProfile(null);
        setStreams([]);
        setVods([]);

        // 1. Fetch user profile
        const profileRes = await api.get(`/users/profile/${username}`);
        const userProfile = profileRes.data;
        setProfile(userProfile);

        // 2. Fetch streams and VODs for that user
        const userId = userProfile.id;
        const [streamsResponse, vodsResponse] = await Promise.all([
          api.get(`/streams?userId=${userId}&status=live&limit=50`),
          api.get(`/vod?userId=${userId}&limit=50`),
        ]);

        setStreams(streamsResponse.data.streams || []);
        setVods(vodsResponse.data.data || []);
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
  }, [username]);

  const itemsToDisplay = activeTab === "live" ? streams : vods;

  const tabClasses = (tabName) =>
    `px-4 py-2 text-lg font-semibold border-b-4 transition-colors duration-200 ${
      activeTab === tabName
        ? "border-purple-500 text-white"
        : "border-transparent text-gray-400 hover:text-gray-200"
    }`;

  if (loading) {
    return <div className="text-center mt-10">Loading channel...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  if (!profile) {
    return (
      <div className="text-center mt-10">This channel does not exist.</div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center bg-gray-800 p-6 rounded-lg mb-8">
        <img
          src={
            profile.avatarUrl ||
            "https://fakeimg.pl/128/282828/eae0d0?text=User"
          }
          alt={profile.displayName}
          className="w-32 h-32 rounded-full border-4 border-purple-500"
        />
        <div className="md:ml-6 mt-4 md:mt-0 text-center md:text-left">
          <h1 className="text-4xl font-bold">
            {profile.displayName || profile.username}
          </h1>
          <p className="text-gray-400">@{profile.username}</p>
          <div className="flex space-x-4 mt-2 justify-center md:justify-start">
            <span>
              <span className="font-bold">{profile.followerCount}</span>{" "}
              Followers
            </span>
          </div>
          <p className="mt-4 text-gray-300">{profile.bio}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab("live")}
          className={tabClasses("live")}
        >
          Live <span className="text-gray-400 ml-1">({streams.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("videos")}
          className={tabClasses("videos")}
        >
          Videos <span className="text-gray-400 ml-1">({vods.length})</span>
        </button>
      </div>

      {/* Content Grid */}
      {itemsToDisplay.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {itemsToDisplay.map((item) => {
            if (activeTab === "live") {
              return <StreamCard key={item.id} data={item} type="stream" />;
            }
            return <VodCard key={item.id} data={item} />;
          })}
        </div>
      ) : (
        <div className="text-center mt-16 text-gray-500">
          <h3 className="text-2xl font-bold">
            No {activeTab === "live" ? "live content" : "videos"}
          </h3>
          <p className="mt-2">
            This user has no {activeTab === "live" ? "live streams" : "videos"}{" "}
            available.
          </p>
        </div>
      )}
    </div>
  );
};

export default Channel;
