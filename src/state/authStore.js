import { create } from "zustand";
import { jwtDecode } from "jwt-decode";

// Helper function to initialize state from the token in localStorage
const initializeAuth = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token || token === "undefined") {
      return { token: null, userInfo: null, isAuthenticated: false };
    }
    const userInfo = jwtDecode(token);

    // Check if the token has expired
    if (userInfo.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      return { token: null, userInfo: null, isAuthenticated: false };
    }
    return { token, userInfo, isAuthenticated: true };
  } catch (error) {
    // If token is invalid, clear it
    localStorage.removeItem("token");
    return { token: null, userInfo: null, isAuthenticated: false };
  }
};

const useAuthStore = create((set) => ({
  ...initializeAuth(),

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

      localStorage.setItem("token", token);
      set({ token, userInfo, isAuthenticated: true });
    } catch (error) {
      localStorage.removeItem("token");
      set({ token: null, userInfo: null, isAuthenticated: false });
    }
  },

  clearAuth: () => {
    localStorage.removeItem("token");
    set({ token: null, userInfo: null, isAuthenticated: false });
  },

  // This function now only updates the in-memory state.
  // The change will be lost on page refresh, as the token is the source of truth.
  // For persistent changes, the backend should issue a new token.
  setUserInfo: (userInfo) => {
    set((state) => ({ ...state, userInfo }));
  },
}));

export default useAuthStore;
