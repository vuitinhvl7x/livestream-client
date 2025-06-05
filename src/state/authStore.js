import { create } from "zustand";

const useAuthStore = create((set) => ({
  token: localStorage.getItem("token") || null,
  userInfo: null,
  isAuthenticated: !!localStorage.getItem("token"),
  setToken: (token) => {
    localStorage.setItem("token", token);
    set({ token, isAuthenticated: true });
  },
  clearAuth: () => {
    localStorage.removeItem("token");
    set({ token: null, userInfo: null, isAuthenticated: false });
  },
  setUserInfo: (userInfo) => set({ userInfo }),
}));

export default useAuthStore;
