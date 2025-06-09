import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppRoutes from "./routes";
import { Toaster } from "sonner";
import Layout from "./components/Layout";
import useAuthStore from "./state/authStore";
import authApi, { injectNavigate } from "./api/authApi";

const App = () => {
  const navigate = useNavigate();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    injectNavigate(navigate);

    const initializeApp = async () => {
      try {
        // Bước 1: Chờ cho state được khôi phục từ localStorage.
        await useAuthStore.persist.rehydrate();

        // Bước 2: Lấy token và các hàm cần thiết từ store SAU KHI rehydrate.
        const { token, setUserInfo, clearAuth } = useAuthStore.getState();

        // Bước 3: Nếu có token, xác thực nó với server.
        if (token) {
          try {
            const response = await authApi.get("/users/me");
            console.log("API RESPONSE from /users/me:", response.data);

            if (response.data && response.data.id) {
              setUserInfo(response.data);
            } else {
              console.error(
                "API did not return valid user data, clearing invalid session."
              );
              clearAuth();
            }
          } catch (error) {
            // Nếu API báo lỗi (vd: 401 Unauthorized), xóa phiên đăng nhập.
            console.error("API call to /users/me failed, clearing session.");
            clearAuth();
          }
        }
      } catch (error) {
        console.error("Failed to rehydrate auth store:", error);
      } finally {
        // Bước 4: Dù có chuyện gì xảy ra, cũng phải kết thúc màn hình loading.
        setIsInitializing(false);
      }
    };

    initializeApp();
  }, [navigate]);

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg font-semibold">Initializing Session...</div>
      </div>
    );
  }

  return (
    <Layout>
      <AppRoutes />
      <Toaster richColors position="top-right" />
    </Layout>
  );
};

export default App;
