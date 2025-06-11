/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { sendChatMessage } from "../lib/socket";

const ChatBox = ({
  messages: initialMessages,
  streamId,
  isLive,
  streamEnded,
  socket,
}) => {
  const [chatMessages, setChatMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    // Update internal state if initial messages from props change
    setChatMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    console.log("socket in Chatbox", socket);
    if (socket) {
      // The parent component is now responsible for connecting and joining the room.
      // This component just needs to listen for chat-related events.
      socket.on("recent_chat_history", ({ messages }) => {
        setChatMessages(() => messages);
      });

      socket.on("new_message", (message) => {
        setChatMessages((prevMessages) => [...prevMessages, message]);
      });

      // Cleanup listeners when the socket instance changes or component unmounts
      return () => {
        socket.off("recent_chat_history");
        socket.off("new_message");
      };
    }
  }, [socket]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && socket && socket.connected) {
      sendChatMessage(streamId, newMessage);
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
            <div key={msg._id || index} className="mb-3 break-words">
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
        {isLive ? (
          socket ? (
            <form onSubmit={handleSendMessage}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Send a message"
                className="w-full bg-gray-700 border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </form>
          ) : (
            <div className="text-center text-gray-400">
              Please{" "}
              <Link
                to="/account/login"
                className="text-purple-400 hover:underline"
              >
                log in
              </Link>{" "}
              to chat.
            </div>
          )
        ) : (
          <div className="text-center text-gray-500">
            Chat is only available during live streams.
          </div>
        )}
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
