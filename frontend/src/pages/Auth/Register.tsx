import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutationWithLoading } from "../../hooks/useLoadingHooks";
import * as apiClient from "../../api-client";
import useAppContext from "../../hooks/useAppContext";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { registerSchema, type RegisterFormData } from "../../schemas/auth.schemas";

const Register = () => {
  const navigate = useNavigate();
  const { showToast } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const mutation = useMutationWithLoading(apiClient.register, {
    onSuccess: async (data) => {
      showToast({
        title: "Registration Successful",
        description:
          "Your account has been created. Please verify your email address to continue.",
        type: "SUCCESS",
      });
      const email = data?.email || data?.user?.email || "";
      if (email) {
        navigate(`/verify-email?email=${encodeURIComponent(email)}`);
      } else {
        navigate("/sign-in");
      }
    },
    onError: (error: Error) => {
      showToast({
        title: "Registration Failed",
        description: error.message,
        type: "ERROR"
      });
    },
    loadingMessage: "Creating your account...",
  });

  const onSubmit = handleSubmit((data) => {
    if (!agreedToTerms) {
      showToast({
        title: "Terms & Conditions",
        description: "Please agree to the Terms & Conditions to continue.",
        type: "ERROR"
      });
      return;
    }
    setIsLoading(true);
    mutation.mutate(data, {
      onSettled: () => setIsLoading(false),
    });
  });

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden concert-bg">
      {/* Abstract Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-500/10 rounded-full blur-[120px] -z-10"></div>

      <div className="relative w-full max-w-[520px] px-4 py-12">
        {/* Main Sign Up Card */}
        <div className="glass-card rounded-xl p-8 md:p-12 flex flex-col shadow-2xl">
          {/* Logo & Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-primary text-4xl font-bold neon-glow">
                confirmation_number
              </span>
              <span className="text-white text-2xl font-bold tracking-tight">TicketVibe</span>
            </div>
            <h1 className="text-white tracking-tight text-[32px] font-bold leading-tight text-center">
              Join the Vibe
            </h1>
            <p className="text-gray-400 text-base font-normal leading-normal text-center mt-2">
              Get early access to the hottest events near you.
            </p>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={onSubmit}>
            {/* First Name Field */}
            <div className="flex flex-col gap-2">
              <label className="text-white text-sm font-medium leading-normal px-1" htmlFor="firstName">
                First Name
              </label>
              <div className="flex w-full items-stretch rounded-xl group">
                <input
                  {...register("firstName")}
                  id="firstName"
                  type="text"
                  autoComplete="given-name"
                  className="form-input flex w-full min-w-0 flex-1 rounded-xl text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-white/10 bg-white/5 h-14 placeholder:text-gray-500 p-[15px] rounded-r-none border-r-0 text-base font-normal transition-all"
                  placeholder="Enter your first name"
                />
                <div className="text-gray-400 flex border border-white/10 bg-white/5 items-center justify-center pr-[15px] rounded-r-xl border-l-0 group-focus-within:border-primary/50 group-focus-within:text-primary">
                  <span className="material-symbols-outlined">person</span>
                </div>
              </div>
              {errors.firstName && (
                <p className="text-red-400 text-sm px-1">{errors.firstName.message}</p>
              )}
            </div>

            {/* Last Name Field */}
            <div className="flex flex-col gap-2">
              <label className="text-white text-sm font-medium leading-normal px-1" htmlFor="lastName">
                Last Name
              </label>
              <div className="flex w-full items-stretch rounded-xl group">
                <input
                  {...register("lastName")}
                  id="lastName"
                  type="text"
                  autoComplete="family-name"
                  className="form-input flex w-full min-w-0 flex-1 rounded-xl text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-white/10 bg-white/5 h-14 placeholder:text-gray-500 p-[15px] rounded-r-none border-r-0 text-base font-normal transition-all"
                  placeholder="Enter your last name"
                />
                <div className="text-gray-400 flex border border-white/10 bg-white/5 items-center justify-center pr-[15px] rounded-r-xl border-l-0 group-focus-within:border-primary/50 group-focus-within:text-primary">
                  <span className="material-symbols-outlined">person</span>
                </div>
              </div>
              {errors.lastName && (
                <p className="text-red-400 text-sm px-1">{errors.lastName.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="flex flex-col gap-2">
              <label className="text-white text-sm font-medium leading-normal px-1" htmlFor="email">
                Email Address
              </label>
              <div className="flex w-full items-stretch rounded-xl group">
                <input
                  {...register("email")}
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="form-input flex w-full min-w-0 flex-1 rounded-xl text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-white/10 bg-white/5 h-14 placeholder:text-gray-500 p-[15px] rounded-r-none border-r-0 text-base font-normal transition-all"
                  placeholder="example@vibe.com"
                />
                <div className="text-gray-400 flex border border-white/10 bg-white/5 items-center justify-center pr-[15px] rounded-r-xl border-l-0 group-focus-within:border-primary/50 group-focus-within:text-primary">
                  <span className="material-symbols-outlined">mail</span>
                </div>
              </div>
              {errors.email && (
                <p className="text-red-400 text-sm px-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2">
              <label className="text-white text-sm font-medium leading-normal px-1" htmlFor="password">
                Password
              </label>
              <div className="flex w-full items-stretch rounded-xl group">
                <input
                  {...register("password")}
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  className="form-input flex w-full min-w-0 flex-1 rounded-xl text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-white/10 bg-white/5 h-14 placeholder:text-gray-500 p-[15px] rounded-r-none border-r-0 text-base font-normal transition-all"
                  placeholder="••••••••"
                />
                <div className="text-gray-400 flex border border-white/10 bg-white/5 items-center justify-center pr-[15px] rounded-r-xl border-l-0 group-focus-within:border-primary/50 group-focus-within:text-primary">
                  <span className="material-symbols-outlined">lock</span>
                </div>
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm px-1">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="flex flex-col gap-2">
              <label className="text-white text-sm font-medium leading-normal px-1" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="flex w-full items-stretch rounded-xl group">
                <input
                  {...register("confirmPassword")}
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  className="form-input flex w-full min-w-0 flex-1 rounded-xl text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-white/10 bg-white/5 h-14 placeholder:text-gray-500 p-[15px] rounded-r-none border-r-0 text-base font-normal transition-all"
                  placeholder="••••••••"
                />
                <div className="text-gray-400 flex border border-white/10 bg-white/5 items-center justify-center pr-[15px] rounded-r-xl border-l-0 group-focus-within:border-primary/50 group-focus-within:text-primary">
                  <span className="material-symbols-outlined">verified_user</span>
                </div>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-sm px-1">{errors.confirmPassword.message}</p>
              )}
              {password && confirmPassword && password === confirmPassword && !errors.confirmPassword && (
                <p className="text-green-400 text-sm px-1">✓ Passwords match</p>
              )}
            </div>

            {/* Terms & Conditions Checkbox */}
            <div className="flex items-center gap-3 px-1 py-2">
              <input
                id="terms"
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-5 h-5 rounded border-white/10 bg-white/5 text-primary focus:ring-primary focus:ring-offset-0 focus:ring-offset-transparent cursor-pointer"
              />
              <label className="text-gray-400 text-sm cursor-pointer select-none" htmlFor="terms">
                I agree to the{" "}
                <a className="text-primary hover:underline" href="#">
                  Terms &amp; Conditions
                </a>{" "}
                and{" "}
                <a className="text-primary hover:underline" href="#">
                  Privacy Policy
                </a>.
              </label>
            </div>

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#8655f6] via-[#a855f7] to-[#d946ef] hover:opacity-90 text-white font-bold py-4 rounded-xl shadow-[0_0_30px_rgba(134,85,246,0.4)] hover:shadow-[0_0_45px_rgba(134,85,246,0.6)] transition-all transform active:scale-[0.98] mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating account...
                </div>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Login Footer */}
          <div className="mt-10 pt-6 border-t border-white/10 text-center">
            <p className="text-gray-400 text-sm font-normal">
              Already have an account?{" "}
              <Link
                to="/sign-in"
                className="text-primary font-semibold hover:text-white transition-colors ml-1"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
