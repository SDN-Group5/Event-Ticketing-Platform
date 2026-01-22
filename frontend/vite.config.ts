import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Removed proxy since we're making direct requests to backend
  server: {
    hmr: {
      // Giữ nguyên state khi HMR (tránh mất session)
      overlay: true, // Hiển thị overlay khi có lỗi
    },
  },
  // QUAN TRỌNG: Preserve module state khi HMR
  // Giúp giữ nguyên queryClient và cache khi code được update
  optimizeDeps: {
    // Giữ nguyên dependencies khi HMR
    holdUntilCrawlEnd: false,
  },
});
