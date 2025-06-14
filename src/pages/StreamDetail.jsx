import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bot, X, Loader2 } from "lucide-react";

import api from "../api";
import authApi from "../api/authApi";
import { getAIModels, summarizeStreamChat } from "../api/aiApi";
import useAuthStore from "../state/authStore";
import VideoPlayer from "../components/VideoPlayer";
import ChatBox from "../components/ChatBox";
import useSocket from "../hooks/useSocket";
import { joinStreamRoom, leaveStreamRoom } from "../lib/socket";
import ExpandableText from "../components/ExpandableText";
import { getImageUrl } from "../utils/image";

const SummarizeChatModal = ({
  dialogRef,
  aiModels,
  isLoadingModels,
  isSummarizing,
  onSubmit,
  onClose,
}) => {
  const [selectedModel, setSelectedModel] = useState("");
  const [numMessages, setNumMessages] = useState(100);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ model: selectedModel || undefined, numMessages });
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="p-0 bg-gray-800 text-white rounded-lg shadow-xl backdrop:bg-black backdrop:opacity-50"
    >
      <div className="w-[90vw] max-w-lg">
        <header className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Bot className="text-sky-400" />
            Configure Chat Summary
          </h2>
          <button
            onClick={() => dialogRef.current?.close()}
            className="p-1 rounded-full hover:bg-gray-700"
          >
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="ai-model" className="block mb-2 font-semibold">
                Select AI Model (Optional)
              </label>
              <select
                id="ai-model"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={isLoadingModels}
                className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="">
                  {isLoadingModels ? "Loading models..." : "Default Model"}
                </option>
                {aiModels?.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="num-messages"
                className="block mb-2 font-semibold"
              >
                Number of Messages (10-500)
              </label>
              <input
                id="num-messages"
                type="number"
                min="10"
                max="500"
                value={numMessages}
                onChange={(e) => setNumMessages(Number(e.target.value))}
                className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
          <footer className="flex justify-end pt-6 mt-4 border-t border-gray-700">
            <button
              type="submit"
              disabled={isSummarizing}
              className="px-4 py-2 bg-sky-600 font-semibold rounded-md hover:bg-sky-700 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSummarizing && <Loader2 className="animate-spin" size={18} />}
              {isSummarizing ? "Summarizing..." : "Generate Summary"}
            </button>
          </footer>
        </form>
      </div>
    </dialog>
  );
};

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
  const dialogRef = useRef(null);
  const [summaryResult, setSummaryResult] = useState(null);

  const { data: aiModels, isLoading: isLoadingModels } = useQuery({
    queryKey: ["aiModels"],
    queryFn: getAIModels,
    staleTime: Infinity, // Models don't change often
    enabled: isAuthenticated, // Only fetch if user is logged in
  });

  const {
    mutate: summarize,
    isPending: isSummarizing,
    error: summaryError,
  } = useMutation({
    mutationFn: (options) => summarizeStreamChat(streamId, options),
    onSuccess: (data) => {
      toast.success("Chat summary generated successfully!");
      setSummaryResult(data);
      dialogRef.current?.close();
    },
    onError: (error) => {
      const errorMsg =
        error.response?.data?.message ||
        "Failed to generate summary. Please try again.";
      toast.error(errorMsg);
      console.error("Summary error:", error);
    },
  });

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
    return (
      <div className="text-center mt-10 text-gray-300">Loading stream...</div>
    );
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  if (!stream) {
    return (
      <div className="text-center mt-10 text-gray-300">Stream not found.</div>
    );
  }
  // console.log("stream.user.avatarUrl in stream detail", stream.user.avatarUrl);
  return (
    <>
      <SummarizeChatModal
        dialogRef={dialogRef}
        aiModels={aiModels}
        isLoadingModels={isLoadingModels}
        isSummarizing={isSummarizing}
        onSubmit={summarize}
        onClose={() => console.log("Dialog closed")}
      />
      <div className="flex flex-col lg:flex-row h-[calc(100vh-theme(height.16))] overflow-y-auto lg:overflow-y-hidden">
        <div className="flex-1 lg:w-3/4 flex flex-col lg:overflow-y-auto">
          <VideoPlayer src={isLive ? stream.playbackUrls : vod?.videoUrl} />
          <div className="p-4">
            <div className="flex justify-between items-start">
              <h1 className="text-2xl font-bold text-white mb-2">
                {stream.title}
              </h1>
              {isAuthenticated && (
                <button
                  onClick={() => dialogRef.current?.showModal()}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-semibold bg-gray-700 text-sky-400 rounded-lg hover:bg-gray-600"
                >
                  <Bot size={16} />
                  <span>Summarize Chat</span>
                </button>
              )}
            </div>
            <ExpandableText>{stream.description}</ExpandableText>

            {summaryResult && (
              <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                <h3 className="text-lg font-bold text-sky-400 flex items-center gap-2 mb-2">
                  <Bot size={20} />
                  AI Chat Summary (Model: {summaryResult.modelUsed})
                </h3>
                <ExpandableText>{summaryResult.summary}</ExpandableText>
              </div>
            )}

            <div className="flex items-center mt-4">
              <Link
                to={`/channel/${stream.user.username}`}
                className="flex items-center"
              >
                <img
                  src={getImageUrl(stream.user.avatarUrl)}
                  alt={stream.user.displayName}
                  className="w-12 h-12 rounded-full mr-4 object-cover flex-shrink-0"
                />
                <div>
                  <p className="font-semibold text-gray-100">
                    {stream.user.displayName}
                  </p>
                  {isLive ? (
                    <p className="text-sm text-gray-300">
                      <span className="text-red-500 font-bold">LIVE</span> |{" "}
                      {currentViewers} viewers
                    </p>
                  ) : (
                    <p className="text-sm text-gray-300">
                      Stream ended |{" "}
                      {vod ? `${vod.viewCount} views` : "No VOD available"}
                    </p>
                  )}
                </div>
              </Link>
            </div>
            <div className="mt-4">
              <Link to={`/categories/${stream.category.slug}`}>
                <span className="text-sm bg-gray-700 text-sky-400 px-3 py-1 rounded-full hover:bg-gray-600 hover:text-sky-300">
                  {stream.category.name}
                </span>
              </Link>
            </div>
          </div>
        </div>
        <aside className="w-full lg:w-1/4 h-1/2 lg:h-full">
          <ChatBox
            messages={messages}
            streamId={streamId}
            isLive={isLive}
            streamEnded={!isLive && !vod}
            socket={socket}
            isConnected={isConnected}
          />
        </aside>
      </div>
    </>
  );
};

export default StreamDetail;
