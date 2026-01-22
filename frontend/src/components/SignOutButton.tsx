import { useQueryClient } from "@tanstack/react-query";
import { useMutationWithLoading } from "../hooks/useLoadingHooks";
import * as apiClient from "../api-client";
import useAppContext from "../hooks/useAppContext";
import { useNavigate } from "react-router-dom";
import { LogOut, Trash2, RefreshCw, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const SignOutButton = () => {
  const queryClient = useQueryClient();
  const { showToast } = useAppContext();
  const navigate = useNavigate();

  const mutation = useMutationWithLoading(apiClient.signOut, {
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["validateToken"] });
      showToast({
        title: "Successfully Signed Out",
        description:
          "You have been logged out of your account. Redirecting to sign-in page...",
        type: "SUCCESS",
      });
      navigate("/sign-in");
      window.location.reload();
    },
    onError: (error: Error) => {
      showToast({
        title: "Sign Out Failed",
        description: error.message,
        type: "ERROR",
      });
    },
    loadingMessage: "Signing out...",
  });

  const clearAuthMutation = useMutationWithLoading(apiClient.signOut, {
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["validateToken"] });
      showToast({
        title: "Auth State Cleared",
        description:
          "Authentication state has been cleared. Redirecting to sign-in page...",
        type: "SUCCESS",
      });
      navigate("/sign-in");
      window.location.reload();
    },
    onError: (error: Error) => {
      showToast({
        title: "Clear Auth Failed",
        description: error.message,
        type: "ERROR",
      });
    },
    loadingMessage: "Clearing auth state...",
  });

  const clearAllStorage = () => {
    apiClient.clearAllStorage();
    showToast({
      title: "Storage Cleared",
      description:
        "All browser storage (localStorage, sessionStorage, cookies) has been cleared. Page will reload...",
      type: "SUCCESS",
    });
    window.location.reload();
  };

  const handleSignOut = () => {
    mutation.mutate(undefined);
  };

  const handleClearAuth = () => {
    clearAuthMutation.mutate(undefined);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center px-6 py-2 bg-white border-4 border-black text-black font-black text-sm uppercase transition-all duration-150 hover:translate-x-1 hover:translate-y-1 active:translate-x-0 active:translate-y-0"
          style={{ boxShadow: "4px 4px 0px 0px #000" }}
        >
          <LogOut className="w-4 h-4 mr-2" strokeWidth={3} />
          Sign Out
          <ChevronDown className="w-4 h-4 ml-1" strokeWidth={3} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 bg-white border-4 border-black"
        align="end"
        style={{ boxShadow: "6px 6px 0px 0px #000" }}
      >
        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-black font-black uppercase focus:bg-yellow-100 focus:text-black"
        >
          <LogOut className="w-4 h-4 mr-2" strokeWidth={3} />
          Sign Out
        </DropdownMenuItem>

        {/* Development utilities - only show in development */}
        {!import.meta.env.PROD && (
          <>
            <DropdownMenuSeparator className="bg-black" />
            <DropdownMenuItem
              onClick={handleClearAuth}
              className="text-red-600 font-black uppercase focus:bg-yellow-100"
            >
              <Trash2 className="w-4 h-4 mr-2" strokeWidth={3} />
              Clear Auth State
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={clearAllStorage}
              className="text-orange-600 font-black uppercase focus:bg-yellow-100"
            >
              <RefreshCw className="w-4 h-4 mr-2" strokeWidth={3} />
              Clear All Storage
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SignOutButton;
