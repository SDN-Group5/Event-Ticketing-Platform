import { useQueryClient } from "@tanstack/react-query";
import { useMutationWithLoading } from "../hooks/useLoadingHooks";
import * as apiClient from "../api-client";
import useAppContext from "../hooks/useAppContext";
import { useNavigate } from "react-router-dom";
import { LogOut, Trash2, RefreshCw, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
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
        <Button
          type="button"
          variant="outline"
          className="border-white/10 bg-white/5 text-white hover:bg-white/10"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
          <ChevronDown className="w-4 h-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 bg-[#1e1a29] border border-white/10 text-white"
        align="end"
      >
        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-white focus:bg-white/10 focus:text-white"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </DropdownMenuItem>

        {/* Development utilities - only show in development */}
        {!import.meta.env.PROD && (
          <>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem
              onClick={handleClearAuth}
              className="text-red-400 focus:bg-white/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Auth State
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={clearAllStorage}
              className="text-orange-300 focus:bg-white/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Clear All Storage
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SignOutButton;
