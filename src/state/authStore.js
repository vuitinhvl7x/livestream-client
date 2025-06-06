import { create } from "zustand";

// Helper function to safely parse JSON from localStorage
const getInitialUserInfo = () => {
  try {
    const userInfo = localStorage.getItem("userInfo");
    return userInfo ? JSON.parse(userInfo) : null;
  } catch (error) {
    console.error("Failed to parse userInfo from localStorage", error);
    return null;
  }
};

const useAuthStore = create((set) => ({
  token: localStorage.getItem("token") || null,
  userInfo: getInitialUserInfo(),
  isAuthenticated: !!localStorage.getItem("token"),

  setAuth: (token, userInfo) => {
    localStorage.setItem("token", token);
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
    set({ token, userInfo, isAuthenticated: true });
  },

  clearAuth: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    set({ token: null, userInfo: null, isAuthenticated: false });
  },

  setUserInfo: (userInfo) => {
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
    set({ userInfo });
  },
}));

export default useAuthStore;
