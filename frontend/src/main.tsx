import React from "react";
import ReactDOM from "react-dom/client";
// ✅ Import console filter để giảm log từ PayOS và third-party libraries
import "./utils/consoleFilter";
import App from "./App.tsx";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppContextProvider } from "./contexts/AppContext.tsx";
import { SearchContextProvider } from "./contexts/SearchContext.tsx";
// ✅ THÊM: ErrorBoundary để bắt lỗi toàn cục
import ErrorBoundary from "./components/ErrorBoundary";

// React Query v5 - QueryClient configuration
// QUAN TRỌNG: Singleton pattern để tránh recreate queryClient khi HMR
// Khi HMR xảy ra, module có thể bị reload → cần check xem queryClient đã tồn tại chưa
let queryClientInstance: QueryClient | null = null;

const getQueryClient = () => {
  // Nếu đã có instance → dùng lại (tránh mất cache khi HMR)
  if (queryClientInstance) {
    return queryClientInstance;
  }

  // Tạo instance mới với cấu hình tối ưu cho session persistence
  queryClientInstance = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 0,
        refetchOnWindowFocus: false,
        refetchOnMount: false, // Không refetch khi component mount lại (tránh mất session khi HMR)
        refetchOnReconnect: false, // Không refetch khi reconnect
        staleTime: 24 * 60 * 60 * 1000, // 24 giờ (JWT token có expiresIn: "1d")
        gcTime: 24 * 60 * 60 * 1000, // Giữ cache 24 giờ (React Query v5 dùng gcTime thay vì cacheTime)
      },
    },
  });

  return queryClientInstance;
};

// Export queryClient để các component khác có thể dùng
export const queryClient = getQueryClient();
// ✅ WRAP APP VỚI ERRORBOUNDARY
// ErrorBoundary sẽ bắt tất cả lỗi trong component tree
// Nếu có lỗi → hiển thị fallback UI thay vì crash toàn bộ app
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
    <QueryClientProvider client={getQueryClient()}>
      <AppContextProvider>
        <SearchContextProvider>
          <App />
        </SearchContextProvider>
      </AppContextProvider>
    </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
