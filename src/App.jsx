import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppRoutes from "./routes";
import { Toaster } from "sonner";
import Layout from "./components/Layout";
import useAuthStore from "./state/authStore";
import authApi, { injectNavigate } from "./api/authApi";
import { connectSocket } from "./lib/socket";

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

            // Kiểm tra kỹ xem `response.data.id` có tồn tại không.
            if (response.data && response.data.id) {
              setUserInfo(response.data);
              connectSocket();
            } else {
              // Nếu API trả về dữ liệu không hợp lệ, xóa phiên đăng nhập.
              clearAuth();
            }
          } catch (error) {
            // Nếu API báo lỗi (vd: 401 Unauthorized), xóa phiên đăng nhập.
            clearAuth();
          }
        }
      } catch (error) {
        // Có lỗi xảy ra trong quá trình rehydrate, vẫn tiếp tục để không kẹt app
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
