/* eslint-disable react/prop-types */
import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import useAuthStore from "../state/authStore";

const ChatBox = ({
  messages: initialMessages,
  streamId,
  isLive,
  streamEnded,
}) => {
  const [chatMessages, setChatMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const socketRef = useRef(null);
  const { token } = useAuthStore();

  useEffect(() => {
    // Update internal state if initial messages from props change
    setChatMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    if (isLive) {
      // Connect to WebSocket if the stream is live
      const socket = io(import.meta.env.VITE_API_BASE_URL, {
        auth: { token },
        transports: ["websocket"],
      });
      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("Socket connected, joining room...");
        socket.emit("join_stream_room", { streamId });
      });

      socket.on("room_joined_successfully", ({ streamId }) => {
        console.log(`Successfully joined room for stream ${streamId}`);
      });

      socket.on("recent_chat_history", ({ messages }) => {
        console.log("Received recent chat history");
        setChatMessages(messages);
      });

      socket.on("new_message", (message) => {
        setChatMessages((prevMessages) => [...prevMessages, message]);
      });

      socket.on("connect_error", (err) => {
        console.error("Socket Connection Error:", err.message);
      });

      socket.on("room_join_error", (error) => {
        console.error("Error joining room:", error.message);
      });

      // Cleanup on component unmount or if stream is no longer live
      return () => {
        console.log("Leaving stream room and disconnecting socket.");
        socket.emit("leave_stream_room", { streamId });
        socket.disconnect();
      };
    }
  }, [streamId, isLive, token]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("chat_message", {
        streamId,
        message: newMessage,
      });
      setNewMessage("");
    }
  };

  const renderChatContent = () => {
    if (isLive) {
      return chatMessages && chatMessages.length > 0 ? (
        chatMessages.map(
          (
            msg,
            index // Use index for key if msg.id is not unique
          ) => (
            <div key={msg.id || index} className="mb-3 break-words">
              <span className="font-bold text-purple-400">
                {msg.username || msg.user?.displayName}:
              </span>
              <span className="ml-2">{msg.message || msg.content}</span>
            </div>
          )
        )
      ) : (
        <div className="text-gray-500 text-center">
          Chat is live. Be the first to say something!
        </div>
      );
    }
    // For ended streams (VODs)
    return initialMessages && initialMessages.length > 0 ? (
      initialMessages.map((msg) => (
        <div key={msg.id} className="mb-3 break-words">
          <span className="font-bold text-purple-400">
            {msg.user.displayName}:
          </span>
          <span className="ml-2">{msg.content}</span>
        </div>
      ))
    ) : (
      <div className="text-gray-500 text-center">
        No chat history available for this stream.
      </div>
    );
  };

  return (
    <div className="bg-gray-800 h-full flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-bold">Stream Chat</h2>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">{renderChatContent()}</div>
      <div className="p-4 border-t border-gray-700">
        <form onSubmit={handleSendMessage}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={!isLive ? "Chat is disabled" : "Send a message"}
            className="w-full bg-gray-700 border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!isLive}
          />
        </form>
        {streamEnded && (
          <p className="text-xs text-center text-gray-400 mt-2">
            This stream has ended. A VOD is not yet available.
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatBox;
