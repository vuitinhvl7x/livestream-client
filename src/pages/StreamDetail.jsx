import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";
import VideoPlayer from "../components/VideoPlayer";
import ChatBox from "../components/ChatBox";

const StreamDetail = () => {
  const { streamId } = useParams();
  const [stream, setStream] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStreamData = async () => {
      try {
        setLoading(true);
        // Fetch stream details and chat messages in parallel
        const [streamResponse, chatResponse] = await Promise.all([
          api.get(`/streams/${streamId}`),
          api.get(`/chat/${streamId}/messages`),
        ]);
        setStream(streamResponse.data.stream);
        setMessages(chatResponse.data.messages);
        setError(null);
      } catch (err) {
        setError("Failed to fetch stream details. It might not exist.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStreamData();
  }, [streamId]);

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
        <VideoPlayer src={stream.playbackUrl} />
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
                <p className="text-sm text-gray-500">
                  {stream.viewerCount} viewers
                </p>
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
        <ChatBox messages={messages} streamId={streamId} />
      </aside>
    </div>
  );
};

export default StreamDetail;
