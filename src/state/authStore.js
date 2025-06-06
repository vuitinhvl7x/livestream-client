import { create } from "zustand";
import { jwtDecode } from "jwt-decode";

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

const getInitialToken = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    return null;
  }
  try {
    const decoded = jwtDecode(token);
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      localStorage.removeItem("userInfo");
      return null;
    }
    return token;
  } catch (error) {
    return null;
  }
};

const useAuthStore = create((set) => {
  const initialToken = getInitialToken();
  return {
    token: initialToken,
    userInfo: getInitialUserInfo(),
    isAuthenticated: !!initialToken,

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
  };
});

export default useAuthStore;
