import { Button } from "../../components/ui/button";
import useAppContext from "../../hooks/useAppContext";
import * as apiClient from "../../api-client";
import { useMutationWithLoading } from "../../hooks/useLoadingHooks";
import { useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, LogOut } from "lucide-react";
import { Link } from "react-router-dom";

export default function AuthHome() {
  const { isLoggedIn, showToast } = useAppContext();
  const queryClient = useQueryClient();

  const signOutMutation = useMutationWithLoading(apiClient.signOut, {
    onSuccess: async () => {
      showToast({
        title: "Đã đăng xuất",
        description: "Bạn đã đăng xuất thành công.",
        type: "SUCCESS",
      });
      await queryClient.invalidateQueries({ queryKey: ["validateToken"] });
    },
    onError: (error: Error) => {
      showToast({
        title: "Đăng xuất thất bại",
        description: error.message,
        type: "ERROR",
      });
    },
    loadingMessage: "Đang đăng xuất...",
  });

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full">
        <div className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-primary-600" />

          {isLoggedIn ? (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    Đã đăng nhập
                  </div>
                  <div className="text-gray-600 text-sm">
                    Token hợp lệ (hoặc đang dùng session localStorage).
                  </div>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={() => signOutMutation.mutate(undefined as any)}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Đăng xuất
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-2xl font-bold text-gray-900">
                Bạn chưa đăng nhập
              </div>
              <div className="text-gray-600">
                Vui lòng đăng nhập để tiếp tục.
              </div>
              <Button asChild className="w-full">
                <Link to="/sign-in">Đi tới trang đăng nhập</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

