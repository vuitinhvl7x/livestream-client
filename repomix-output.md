This file is a merged representation of a subset of the codebase, containing specifically included files and files not matching ignore patterns, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
4. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Only files matching these patterns are included: **/*.{js,ts}
- Files matching these patterns are excluded: worker-configuration.d.ts
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

## Additional Info

# Directory Structure
```
eslint.config.js
src/api/authApi.js
src/api/categoryApi.js
src/api/index.js
src/api/notificationApi.js
src/api/streamApi.js
src/api/userApi.js
src/api/vodApi.js
src/hooks/useSocket.js
src/lib/socket.js
src/state/authStore.js
src/utils/image.js
vite.config.js
```

# Files

## File: eslint.config.js
```javascript
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
]
```

## File: src/api/index.js
```javascript
import axios from "axios";

// Vite's proxy will handle the redirection to the backend server.
// See vite.config.js for proxy configuration.
const api = axios.create({
  baseURL: "/api", // This should match the proxy path
});

export default api;
```

## File: src/api/notificationApi.js
```javascript
import authApi from "./authApi";

export const getNotifications = async (params) => {
  try {
    const response = await authApi.get("/notifications", { params });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching notifications:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await authApi.post(
      `/notifications/${notificationId}/read`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error marking notification ${notificationId} as read:`,
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const response = await authApi.post("/notifications/read-all");
    return response.data;
  } catch (error) {
    console.error(
      "Error marking all notifications as read:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};
```

## File: src/hooks/useSocket.js
```javascript
import { useState, useEffect } from "react";
import { getSocket } from "../lib/socket";

const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const s = getSocket();
    setSocket(s);

    if (s) {
      setIsConnected(s.connected);

      const onConnect = () => setIsConnected(true);
      const onDisconnect = () => setIsConnected(false);

      s.on("connect", onConnect);
      s.on("disconnect", onDisconnect);

      return () => {
        s.off("connect", onConnect);
        s.off("disconnect", onDisconnect);
      };
    }
  }, []);

  return { socket, isConnected };
};

export default useSocket;
```

## File: src/lib/socket.js
```javascript
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
```

## File: src/api/categoryApi.js
```javascript
import api from "./index";

export const getCategories = async () => {
  try {
    const response = await api.get("/categories");
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching categories:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

export const searchCategories = async (query) => {
  try {
    const response = await api.get(
      `/categories/search/name?q=${query}&limit=10`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error searching categories:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};
```

## File: src/api/streamApi.js
```javascript
import api from "./index";
import authApi from "./authApi";

export const getStreams = async (params) => {
  try {
    const response = await api.get("/streams", { params });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching streams:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

export const getStreamById = async (streamId) => {
  try {
    const response = await api.get(`/streams/${streamId}`);
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching stream ${streamId}:`,
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

export const updateStream = async (streamId, formData) => {
  try {
    const response = await authApi.put(`/streams/${streamId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      `Error updating stream ${streamId}:`,
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

export const createStream = async (formData) => {
  try {
    const response = await authApi.post("/streams", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error creating stream:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

const streamApi = {
  searchStreams: (params) => {
    return api.get("/streams/search", { params });
  },
};

export default streamApi;
```

## File: src/api/userApi.js
```javascript
import authApi from "./authApi";
import api from "./index";

export const getMyProfile = async () => {
  try {
    const response = await authApi.get("/users/me");
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching my profile:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

export const getUserProfile = async (username) => {
  try {
    const response = await authApi.get(`/users/profile/${username}`);
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching profile for ${username}:`,
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

export const followUser = async (userId) => {
  try {
    const response = await authApi.post(`/social/${userId}/follow`);
    return response.data;
  } catch (error) {
    console.error(
      `Error following user ${userId}:`,
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

export const unfollowUser = async (userId) => {
  try {
    const response = await authApi.delete(`/social/${userId}/unfollow`);
    return response.data;
  } catch (error) {
    console.error(
      `Error unfollowing user ${userId}:`,
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

export const updateMyProfile = async (formData) => {
  try {
    const response = await authApi.put("/users/me/profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error updating my profile:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

export const getFollowers = async (userId, page = 1, limit = 10) => {
  try {
    const response = await authApi.get(`/social/${userId}/followers`, {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching followers:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

export const getFollowing = async (userId, page = 1, limit = 10) => {
  try {
    const response = await authApi.get(`/social/${userId}/following`, {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching following:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};
```

## File: src/utils/image.js
```javascript
import fakeImage from "/hinh-anh-tai-khoan-het-tien-18.jpg";

export const getImageUrl = (url) => {
  return fakeImage;
};
```

## File: src/api/authApi.js
```javascript
import axios from "axios";
import useAuthStore from "../state/authStore";
import { toast } from "sonner";

// This will be populated by a React component
let navigate;

export const injectNavigate = (nav) => {
  navigate = nav;
};

const authApi = axios.create({
  // The base URL will be proxied by Vite, so we only need the base path if any.
  // In our case, the proxy handles '/api', so we can even leave this empty
  // and call authApi.post('/users/logout')
  baseURL: "/api",
});

// Request interceptor to add the auth token to every request
authApi.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
authApi.interceptors.response.use(
  (response) => response, // Pass through successful responses
  (error) => {
    // Check if the error is due to an expired or invalid token (401 Unauthorized)
    if (error.response && error.response.status === 401) {
      const { clearAuth, token } = useAuthStore.getState();

      // Only clear auth and redirect if a token was present
      if (token) {
        clearAuth();
        toast.error("Your session has expired. Please log in again.");

        if (navigate) {
          navigate("/account/login"); // Use React Router's navigation
        } else {
          // Fallback if navigate is not available for some reason
          console.error(
            "Navigate function not available. Falling back to full reload."
          );
          window.location.href = "/account/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default authApi;
```

## File: src/api/vodApi.js
```javascript
import api from "./authApi";

export const getVodsByUserId = async (userId, limit = 50) => {
  try {
    const response = await api.get(`/vod`, {
      params: { userId, limit },
    });
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching vods for user ${userId}:`,
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

export const uploadVOD = async (formData) => {
  try {
    const response = await api.post("/vod/upload-local", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error uploading VOD:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

export const deleteVOD = async (vodId) => {
  try {
    const response = await api.delete(`/vod/${vodId}`);
    return response.data;
  } catch (error) {
    console.error(
      `Error deleting VOD ${vodId}:`,
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

const vodApi = {
  searchVODs: (params) => {
    return api.get("/vod/search", { params });
  },
};

export default vodApi;
```

## File: vite.config.js
```javascript
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // <--- Thêm dòng này!
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
```

## File: src/state/authStore.js
```javascript
import { create } from "zustand";
import { jwtDecode } from "jwt-decode";
import { persist } from "zustand/middleware";
import { disconnectSocket } from "../lib/socket";

const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      userInfo: null,
      isAuthenticated: false,
      setAuth: (token) => {
        try {
          if (!token) {
            throw new Error("No token provided");
          }
          const userInfo = jwtDecode(token);

          // Check for expiration before setting
          if (userInfo.exp * 1000 < Date.now()) {
            throw new Error("Token expired");
          }
          set({ token, userInfo, isAuthenticated: true });
        } catch (error) {
          set({ token: null, userInfo: null, isAuthenticated: false });
        }
      },

      clearAuth: () => {
        disconnectSocket();
        set({ token: null, userInfo: null, isAuthenticated: false });
      },

      setUserInfo: (userInfo) => {
        set({ userInfo });
      },
    }),
    {
      name: "auth-storage", // Tên của item trong storage, phải là duy nhất
    }
  )
);

export default useAuthStore;
```
