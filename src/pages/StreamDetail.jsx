import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";
import authApi from "../api/authApi";
import useAuthStore from "../state/authStore";
import VideoPlayer from "../components/VideoPlayer";
import ChatBox from "../components/ChatBox";
import useSocket from "../hooks/useSocket";
import { joinStreamRoom, leaveStreamRoom } from "../lib/socket";

const StreamDetail = () => {
  const { streamId } = useParams();
  const [stream, setStream] = useState(null);
  const [vod, setVod] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentViewers, setCurrentViewers] = useState(0);
  const { isAuthenticated } = useAuthStore();
  const { socket, isConnected } = useSocket();

  const isLive = stream?.status === "live";

  useEffect(() => {
    const fetchStreamAndVodDetails = async () => {
      try {
        setLoading(true);
        const streamResponse = await api.get(`/streams/${streamId}`);
        const currentStream = streamResponse.data.stream;
        setStream(currentStream);
        setCurrentViewers(currentStream.viewerCount || 0);

        if (currentStream.status === "ended") {
          const vodResponse = await api.get(`/vod?streamId=${streamId}`);
          if (vodResponse.data.data && vodResponse.data.data.length > 0) {
            setVod(vodResponse.data.data[0]);
          }
        }
        setError(null);
      } catch (err) {
        setError(
          "Failed to fetch stream details. The stream might not exist or the service is down."
        );
        console.error("Error fetching stream details:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchChatMessages = async () => {
      if (isAuthenticated) {
        try {
          const chatResponse = await authApi.get(`/chat/${streamId}/messages`);
          setMessages(chatResponse.data.messages || []);
        } catch (err) {
          console.error("Error fetching chat messages:", err);
        }
      }
    };

    fetchStreamAndVodDetails();
    fetchChatMessages();
  }, [streamId, isAuthenticated]);

  useEffect(() => {
    if (socket && isConnected && isLive) {
      joinStreamRoom(streamId);

      const handleViewerCount = (data) => {
        if (data && String(data.streamId) === String(streamId)) {
          setCurrentViewers(data.count);
        }
      };

      socket.on("viewer_count_updated", handleViewerCount);

      return () => {
        leaveStreamRoom(streamId);
        socket.off("viewer_count_updated", handleViewerCount);
      };
    }
  }, [streamId, isLive, socket, isConnected]);

  if (loading) {
    return <div className="text-center mt-10">Loading stream...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  if (!stream) {
    return (
      <div className="text-center mt-10 text-gray-500">Stream not found.</div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-theme(height.16))]">
      <div className="flex-1 lg:w-3/4 flex flex-col">
        <VideoPlayer src={isLive ? stream.playbackUrls : vod?.videoUrl} />
        <div className="p-4">
          <h1 className="text-3xl font-bold">{stream.title}</h1>
          <p className="text-gray-400 mt-2">{stream.description}</p>
          <div className="flex items-center mt-4">
            <Link
              to={`/channel/${stream.user.username}`}
              className="flex items-center"
            >
              <img
                src={
                  stream.user.avatarUrl ||
                  "https://fakeimg.pl/40/282828/eae0d0?text=A"
                }
                alt={stream.user.displayName}
                className="w-12 h-12 rounded-full mr-4"
              />
              <div>
                <p className="font-bold hover:text-purple-400">
                  {stream.user.displayName}
                </p>
                {isLive ? (
                  <p className="text-sm text-gray-500">
                    <span className="text-red-500 font-bold">LIVE</span> |{" "}
                    {currentViewers} viewers
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">
                    Stream ended |{" "}
                    {vod ? `${vod.viewCount} views` : "No VOD available"}
                  </p>
                )}
              </div>
            </Link>
          </div>
          <div className="mt-4">
            <Link to={`/categories/${stream.category.slug}`}>
              <span className="text-sm bg-gray-700 text-purple-400 px-3 py-1 rounded-full hover:bg-gray-600">
                {stream.category.name}
              </span>
            </Link>
          </div>
        </div>
      </div>
      <aside className="w-full lg:w-1/4">
        <ChatBox
          messages={messages}
          streamId={streamId}
          isLive={isLive}
          streamEnded={!isLive && !vod}
          socket={socket}
        />
      </aside>
    </div>
  );
};

export default StreamDetail;
