/* eslint-disable react/prop-types */
import React, { useState } from "react";

const ChatBox = ({ messages, streamId }) => {
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = (e) => {
    e.preventDefault();
    // TODO: Implement send message functionality via WebSocket
    console.log(`Sending message to ${streamId}:`, newMessage);
    setNewMessage("");
  };

  return (
    <div className="bg-gray-800 h-full flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-bold">Stream Chat</h2>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        {messages && messages.length > 0 ? (
          messages.map((msg) => (
            <div key={msg.id} className="mb-3">
              <span className="font-bold text-purple-400">
                {msg.user.displayName}:
              </span>
              <span className="ml-2">{msg.content}</span>
            </div>
          ))
        ) : (
          <div className="text-gray-500">No messages yet.</div>
        )}
      </div>
      <div className="p-4 border-t border-gray-700">
        <form onSubmit={handleSendMessage}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Send a message"
            className="w-full bg-gray-700 border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </form>
      </div>
    </div>
  );
};

export default ChatBox;
