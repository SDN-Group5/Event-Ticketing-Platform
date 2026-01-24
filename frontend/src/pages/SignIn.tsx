import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useMutationWithLoading } from "../hooks/useLoadingHooks";
import * as apiClient from "../api-client";
import useAppContext from "../hooks/useAppContext";
import { useUserStore } from "../stores/userStore";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { signInSchema, type SignInFormData } from "../schemas/auth.schemas";

const SignIn = () => {
  const { showToast } = useAppContext();
  const { setCurrentUser } = useUserStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const location = useLocation();

  // ✅ SỬ DỤNG ZOD SCHEMA VỚI REACT HOOK FORM
  // zodResolver: Bridge giữa Zod schema và React Hook Form
  // - Tự động validate theo schema
  // - Tự động hiển thị error messages từ schema
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema), // ✅ THÊM: Dùng Zod schema để validate
  });

  const mutation = useMutationWithLoading(apiClient.signIn, {
    onSuccess: async () => {
      showToast({
        title: "Sign In Successful",
        description:
          "Welcome back! You have been successfully signed in to your account.",
        type: "SUCCESS",
      });

      // Invalidate và fetch lại user info
      await queryClient.invalidateQueries({ queryKey: ["validateToken"] });
      await queryClient.invalidateQueries({ queryKey: ["fetchCurrentUser"] });

      // Fetch user info để biết role
      try {
        const currentUser = await apiClient.fetchCurrentUser();

        // Lưu user info vào Zustand store
        setCurrentUser(currentUser);

        // Redirect theo role (Event Ticketing Platform)
        const roleRedirects: Record<string, string> = {
          customer: location.state?.from?.pathname || "/",
          organizer: "/dashboard/organizer",
          staff: "/dashboard/staff",
          admin: "/dashboard/admin",
        };

        const userRole = currentUser.role || "customer";
        const redirectPath = roleRedirects[userRole] || "/";
        navigate(redirectPath);
      } catch (error) {
        // Nếu không fetch được user, redirect về trang trước hoặc home
        navigate(location.state?.from?.pathname || "/");
      }
    },
    onError: (error: Error) => {
      showToast({
        title: "Sign In Failed",
        description: error.message,
        type: "ERROR",
      });
    },
    loadingMessage: "Signing you in...",
  });

  const onSubmit = handleSubmit((data) => {
    setIsLoading(true);
    mutation.mutate(data, {
      onSettled: () => setIsLoading(false),
    });
  });

  return (
    <main className="flex-1 flex items-center justify-center p-6 concert-bg">
      <div className="w-full max-w-[480px] neon-border-glow">
        <div className="glass-card rounded-3xl p-8 md:p-12 relative overflow-hidden">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-3">
              Welcome Back
            </h1>
            <p className="text-slate-400">
              Please enter your details to sign in
            </p>
          </div>

          <form className="space-y-6" onSubmit={onSubmit}>
            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-slate-300 ml-1"
              >
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary transition-colors">
                  <span className="material-symbols-outlined text-xl">
                    mail
                  </span>
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="block w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  placeholder="name@example.com"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-400 mt-1 ml-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-300"
                >
                  Password
                </label>
                <a
                  href="#"
                  className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  <Link
                    to="/forgot-password"
                    className="text-primary hover:text-primary/80 font-semibold transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary transition-colors">
                  <span className="material-symbols-outlined text-xl">
                    lock
                  </span>
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className="block w-full pl-11 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  placeholder="••••••••"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-400 mt-1 ml-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 text-white font-bold rounded-xl transition-all text-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center
              bg-gradient-to-r from-[#8655f6] via-[#a855f7] to-[#d946ef]
              shadow-[0_18px_45px_-18px_rgba(134,85,246,0.65)]
              hover:shadow-[0_22px_55px_-18px_rgba(217,70,239,0.55)]
              hover:-translate-y-0.5 active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-5 w-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Login"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#1e1a29]/70 backdrop-blur px-4 text-slate-400 tracking-widest rounded-full border border-white/10">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              className="flex items-center justify-center gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors group"
            >
              <img
                alt="Google"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBLcouL7qZ7mkawm7hPgHfIdzVBiEw6H_hrOgRZaZ4PHyaBTvJL5pFIBfbdVc6ZmLtdauwdRzoarkostlw-geXwZDStz4myxiqbVG40-CBOF14AKWCctxkK3np74Y4RNeqqB7Chr8qkmksh79hzTmIhl6fi9k3EESE3eSnhWdgCMzdIr53eAzHxaB6lujVM2JD_JYLspJDOnUSpCiwB2EK5tRxoh_lyPWDA0QcIBL_a7RwKvsr8unJn1GxUG6gFzFRU6K-E5cfwhdPl"
                className="w-5 h-5"
              />
              <span className="text-sm font-semibold text-slate-200">
                Google
              </span>
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors group"
            >
              <svg
                className="w-5 h-5 fill-white"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z" />
              </svg>
              <span className="text-sm font-semibold text-slate-200">
                Apple
              </span>
            </button>
          </div>

          {/* Footer inside card */}
          <div className="mt-10 text-center">
            <p className="text-slate-400 text-sm">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-primary hover:text-primary/80 font-bold transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default SignIn;
