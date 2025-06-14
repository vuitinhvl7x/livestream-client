/* eslint-disable react/prop-types */
import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Link } from "react-router-dom";
import { sendChatMessage } from "../lib/socket";

const ChatBox = ({
  messages: initialMessages,
  streamId,
  isLive,
  streamEnded,
  socket,
  isConnected,
}) => {
  const [chatMessages, setChatMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [hasMoreOlderMessages, setHasMoreOlderMessages] = useState(true);
  const chatContainerRef = useRef(null);
  const isPrependingRef = useRef(false);
  const prevScrollHeightRef = useRef(null);

  useEffect(() => {
    // This effect is for VOD chat history, which is passed directly via props
    if (!isLive) {
      setChatMessages(initialMessages);
    }
  }, [initialMessages, isLive]);

  useLayoutEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (isPrependingRef.current && prevScrollHeightRef.current !== null) {
      // Restore scroll position after prepending older messages
      chatContainer.scrollTop =
        chatContainer.scrollHeight - prevScrollHeightRef.current;
      isPrependingRef.current = false;
      prevScrollHeightRef.current = null;
    }
  }, [chatMessages]);

  useEffect(() => {
    if (isLive && !isPrependingRef.current) {
      const chatContainer = chatContainerRef.current;
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  }, [chatMessages, isLive]);

  useEffect(() => {
    if (socket) {
      const handleRecentChatHistory = ({ messages }) => {
        setChatMessages(messages);
        // If we receive less than the initial batch size, assume no more older messages
        setHasMoreOlderMessages(messages.length === 50);
        // On initial load, scroll to bottom
        const chatContainer = chatContainerRef.current;
        if (chatContainer) {
          // Use timeout to ensure DOM is updated before scrolling
          setTimeout(() => {
            chatContainer.scrollTop = chatContainer.scrollHeight;
          }, 0);
        }
      };

      const handleNewMessage = (message) => {
        const chatContainer = chatContainerRef.current;
        // Determine if user is scrolled near the bottom before adding new message
        const isScrolledToBottom =
          chatContainer.scrollHeight - chatContainer.clientHeight <=
          chatContainer.scrollTop + 1;

        setChatMessages((prevMessages) => [...prevMessages, message]);

        if (isScrolledToBottom) {
          setTimeout(() => {
            chatContainer.scrollTop = chatContainer.scrollHeight;
          }, 0);
        }
      };

      const handleOlderChatHistory = ({ messages }) => {
        if (messages.length > 0) {
          isPrependingRef.current = true;
          prevScrollHeightRef.current = chatContainerRef.current.scrollHeight;
          setChatMessages((prev) => [...messages, ...prev]);
        } else {
          setHasMoreOlderMessages(false);
        }
        setIsLoadingOlder(false);
      };

      socket.on("recent_chat_history", handleRecentChatHistory);
      socket.on("new_message", handleNewMessage);
      socket.on("older_chat_history", handleOlderChatHistory);

      return () => {
        socket.off("recent_chat_history", handleRecentChatHistory);
        socket.off("new_message", handleNewMessage);
        socket.off("older_chat_history", handleOlderChatHistory);
      };
    }
  }, [socket]);

  const loadOlderMessages = () => {
    if (
      isLoadingOlder ||
      !hasMoreOlderMessages ||
      !socket ||
      chatMessages.length === 0
    )
      return;

    setIsLoadingOlder(true);
    const oldestMessage = chatMessages[0];
    socket.emit("get_older_messages", {
      streamId,
      beforeTimestamp: oldestMessage.createdAt || oldestMessage.timestamp,
    });
  };

  const handleScroll = () => {
    if (chatContainerRef.current?.scrollTop === 0) {
      loadOlderMessages();
    }
  };

  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    chatContainer?.addEventListener("scroll", handleScroll);
    return () => chatContainer?.removeEventListener("scroll", handleScroll);
  }, [socket, isLoadingOlder, hasMoreOlderMessages, chatMessages]); // Re-add listener if dependencies change

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
              <span className="font-bold text-sky-400">
                {msg.username || msg.user?.displayName}:
              </span>
              <span className="ml-2 text-gray-300">
                {msg.message || msg.content}
              </span>
            </div>
          )
        )
      ) : (
        <div className="text-gray-300 text-center">
          Chat is live. Be the first to say something!
        </div>
      );
    }
    // For ended streams (VODs)
    return initialMessages && initialMessages.length > 0 ? (
      initialMessages.map((msg) => (
        <div key={msg.id} className="mb-3 break-words">
          <span className="font-bold text-sky-400">
            {msg.user.displayName}:
          </span>
          <span className="ml-2 text-gray-300">{msg.content}</span>
        </div>
      ))
    ) : (
      <div className="text-gray-300 text-center">
        No chat history available for this stream.
      </div>
    );
  };

  return (
    <div className="bg-gray-800 h-full flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-semibold text-gray-100">Stream Chat</h2>
      </div>
      <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto">
        {isLoadingOlder && (
          <div className="text-center text-gray-400 p-2">
            Loading older messages...
          </div>
        )}
        {renderChatContent()}
      </div>
      <div className="p-4 border-t border-gray-700">
        {isLive ? (
          socket && socket.connected ? (
            <form onSubmit={handleSendMessage}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Send a message"
                className="w-full bg-gray-700 border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-sky-500 text-white"
              />
            </form>
          ) : (
            <div className="text-center text-gray-300">
              Please{" "}
              <Link
                to="/account/login"
                className="text-sky-400 hover:text-sky-300"
              >
                log in
              </Link>{" "}
              to chat.
            </div>
          )
        ) : (
          <div className="text-center text-gray-300">
            Chat is only available during live streams.
          </div>
        )}
        {streamEnded && (
          <p className="text-xs text-center text-gray-300 mt-2">
            This stream has ended. A VOD is not yet available.
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatBox;
