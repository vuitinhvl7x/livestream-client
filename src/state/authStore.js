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
