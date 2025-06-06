import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import StreamCard from "../components/StreamCard";

const Channel = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [streams, setStreams] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        setLoading(true);
        setError(null);

        // This is inefficient, as noted in the docs.
        // A dedicated endpoint `/api/users/by-username/:username` would be better.
        const usersResponse = await api.get("/users/all");
        const user = usersResponse.data.users.find(
          (u) => u.username === username
        );

        if (!user) {
          setError("User not found.");
          setLoading(false);
          return;
        }

        const userId = user.id;

        // Fetch profile, streams, and social data in parallel
        const [profileRes, streamsRes, followersRes, followingRes] =
          await Promise.all([
            api.get(`/users/profile/${userId}`),
            api.get(`/streams?userId=${userId}`),
            api.get(`/social/${userId}/followers`),
            api.get(`/social/${userId}/following`),
          ]);

        setProfile(profileRes.data.user);
        setStreams(streamsRes.data.streams);
        setFollowers(followersRes.data.followers);
        setFollowing(followingRes.data.following);
      } catch (err) {
        setError("Failed to fetch channel data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchChannelData();
  }, [username]);

  if (loading) {
    return <div className="text-center mt-10">Loading channel...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  if (!profile) {
    return null; // Or another message
  }

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center bg-gray-800 p-6 rounded-lg">
        <img
          src={
            profile.avatarUrl ||
            "https://fakeimg.pl/128/282828/eae0d0?text=User"
          }
          alt={profile.displayName}
          className="w-32 h-32 rounded-full border-4 border-purple-500"
        />
        <div className="md:ml-6 mt-4 md:mt-0 text-center md:text-left">
          <h1 className="text-4xl font-bold">{profile.displayName}</h1>
          <p className="text-gray-400">@{profile.username}</p>
          <div className="flex space-x-4 mt-2 justify-center md:justify-start">
            <span>
              <span className="font-bold">{followers.length}</span> Followers
            </span>
            <span>
              <span className="font-bold">{following.length}</span> Following
            </span>
          </div>
          <p className="mt-4 text-gray-300">{profile.bio}</p>
        </div>
      </div>

      {/* Streams */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Streams</h2>
        {streams.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {streams.map((stream) => (
              <StreamCard key={stream.id} stream={stream} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">This user has no streams yet.</p>
        )}
      </div>
    </div>
  );
};

export default Channel;
