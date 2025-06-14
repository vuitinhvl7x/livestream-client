import { io } from "socket.io-client";
import useAuthStore from "../state/authStore";
import { toast } from "sonner";

const VITE_API_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

let socket;

export const getSocket = () => {
  if (!socket) {
    const token = useAuthStore.getState().token;
    if (!token) {
      // It's okay to not have a token initially.
      // The socket can be used by non-authenticated users for some features.
      // Auth is checked when connecting.
      console.log("Creating socket instance without initial token.");
    }

    // Use the same config as StreamDetail.jsx for consistency
    socket = io(VITE_API_URL, {
      path: "/app/socket.io",
      autoConnect: false,
      transports: ["websocket"],
      auth: {
        token: token, // The token can be null initially
      },
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      // After connection, we can join the notification room
      joinNotificationRoom();
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
      if (error.message === "Authentication error") {
        toast.error("Socket authentication failed. Please log in again.");
        useAuthStore.getState().clearAuth(); // This will also disconnect the socket
      }
    });

    socket.on("new_notification", (data) => {
      console.log("New notification received:", data);
      toast.info(data.message || "You have a new notification!");
    });
  }
  return socket;
};

export const connectSocket = () => {
  let s = getSocket();

  // If the token has been set since the socket was created, update it
  const token = useAuthStore.getState().token;
  if (s && token) {
    s.auth.token = token;
  } else if (!token) {
    // If there's no token, we can't authenticate.
    // Depending on the app's logic, we might not connect at all.
    // For now, we allow connection without a token for guest features.
    console.log("Attempting to connect socket without a token.");
  }

  if (s && !s.connected) {
    s.connect();
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null; // Important to nullify for re-creation
  }
};

// --- Room Management Functions ---

export const joinNotificationRoom = () => {
  const userId = useAuthStore.getState().userInfo?.id;
  if (socket && socket.connected && userId) {
    socket.emit("join_notification_room", { userId });
    console.log(`User ${userId} joined notification room.`);
  }
};

export const joinStreamRoom = (streamId) => {
  if (socket && socket.connected) {
    socket.emit("join_stream_room", { streamId });
    console.log(`Joined stream room: ${streamId}`);
  }
};

export const leaveStreamRoom = (streamId) => {
  if (socket && socket.connected) {
    socket.emit("leave_stream_room", { streamId });
    console.log(`Left stream room: ${streamId}`);
  }
};

// --- Event Emitters ---

export const sendChatMessage = (streamId, message) => {
  if (socket && socket.connected) {
    socket.emit("chat_message", { streamId, message });
  }
};
