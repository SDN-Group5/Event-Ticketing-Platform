import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import * as apiClient from "../api-client";
import useAppContext from "../hooks/useAppContext";
import { Link } from "react-router-dom";

const resetPasswordSchema = z
  .object({
    code: z.string().length(6, "Mã phải có 6 số"),
    newPassword: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const ResetPassword = () => {
  const { showToast } = useAppContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [codeDigits, setCodeDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false);

  const email = useMemo(() => searchParams.get("email") || "", [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const newPassword = watch("newPassword");
  const confirmPassword = watch("confirmPassword");

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  // Update code field khi user nhập OTP
  useEffect(() => {
    const code = codeDigits.join("");
    setValue("code", code);
  }, [codeDigits, setValue]);

  const handleChangeDigit = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const next = [...codeDigits];
    next[index] = value;
    setCodeDigits(next);

    if (value && index < 5) {
      const nextInput = document.getElementById(
        `reset-otp-${index + 1}`
      ) as HTMLInputElement | null;
      nextInput?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Backspace" && !codeDigits[index] && index > 0) {
      const prevInput = document.getElementById(
        `reset-otp-${index - 1}`
      ) as HTMLInputElement | null;
      prevInput?.focus();
    }
  };

  // Verify code trước khi cho phép đặt password mới
  const handleVerifyCode = async () => {
    const code = codeDigits.join("");
    if (code.length !== 6) {
      showToast({
        title: "Lỗi",
        description: "Vui lòng nhập đầy đủ 6 số",
        type: "ERROR",
      });
      return;
    }

    try {
      setIsVerifyingCode(true);
      await apiClient.verifyResetCode({ email, code });
      setIsCodeVerified(true);
      showToast({
        title: "Mã hợp lệ",
        description: "Bạn có thể đặt lại mật khẩu mới.",
        type: "SUCCESS",
      });
    } catch (error: any) {
      showToast({
        title: "Lỗi",
        description: error?.message || "Mã reset không đúng hoặc đã hết hạn.",
        type: "ERROR",
      });
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    if (!isCodeVerified) {
      showToast({
        title: "Lỗi",
        description: "Vui lòng xác thực mã reset trước.",
        type: "ERROR",
      });
      return;
    }

    try {
      await apiClient.resetPassword({
        email,
        code: data.code,
        newPassword: data.newPassword,
      });

      showToast({
        title: "Thành công",
        description: "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập với mật khẩu mới.",
        type: "SUCCESS",
      });

      setTimeout(() => {
        navigate("/sign-in");
      }, 1500);
    } catch (error: any) {
      showToast({
        title: "Lỗi",
        description: error?.message || "Không thể đặt lại mật khẩu.",
        type: "ERROR",
      });
    }
  });

  return (
    <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden bg-background-dark">
      {/* Abstract Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] -z-10" />

      <div className="layout-content-container flex flex-col max-w-[520px] w-full">
        <div className="glass-card p-10 md:p-14 rounded-xl flex flex-col items-center shadow-2xl">
          {/* Icon */}
          <div className="mb-8 p-6 bg-primary/10 rounded-full">
            <span className="material-symbols-outlined text-primary text-6xl block">
              lock_reset
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-white tracking-tight text-3xl font-bold leading-tight text-center pb-3">
            Đặt lại mật khẩu
          </h1>
          <p className="text-white/60 text-base font-normal leading-relaxed text-center pb-8">
            Nhập mã 6 số đã được gửi đến{" "}
            <span className="text-white font-medium">{email}</span> và mật khẩu mới của bạn.
          </p>

          {/* Form */}
          <form onSubmit={onSubmit} className="w-full">
            {/* OTP Input */}
            <div className="mb-6">
              <label className="block text-white text-sm font-medium mb-2">
                Mã reset (6 số)
              </label>
              <div className="flex justify-center w-full mb-4">
                <fieldset className="relative flex gap-3 md:gap-4">
                  {codeDigits.map((digit, index) => (
                    <input
                      key={index}
                      id={`reset-otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChangeDigit(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="otp-input flex h-14 w-11 md:w-14 text-center bg-white/5 border border-white/10 rounded-lg text-white text-xl font-bold focus:outline-0 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      placeholder="·"
                      disabled={isCodeVerified}
                    />
                  ))}
                </fieldset>
              </div>
              {!isCodeVerified && (
                <button
                  type="button"
                  onClick={handleVerifyCode}
                  disabled={isVerifyingCode || codeDigits.join("").length !== 6}
                  className="w-full h-12 px-4 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                >
                  {isVerifyingCode ? "Đang xác thực..." : "Xác thực mã"}
                </button>
              )}
              {isCodeVerified && (
                <p className="text-green-400 text-sm text-center mb-4">
                  ✅ Mã đã được xác thực
                </p>
              )}
              <input type="hidden" {...register("code")} />
            </div>

            {/* New Password */}
            <div className="mb-4">
              <label
                htmlFor="newPassword"
                className="block text-white text-sm font-medium mb-2"
              >
                Mật khẩu mới
              </label>
              <input
                id="newPassword"
                type="password"
                {...register("newPassword")}
                className="w-full h-14 px-4 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-0 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                placeholder="Nhập mật khẩu mới"
                autoComplete="new-password"
                disabled={!isCodeVerified}
              />
              {errors.newPassword && (
                <p className="text-red-400 text-sm mt-2">{errors.newPassword.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="mb-6">
              <label
                htmlFor="confirmPassword"
                className="block text-white text-sm font-medium mb-2"
              >
                Xác nhận mật khẩu
              </label>
              <input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword")}
                className="w-full h-14 px-4 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-0 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                placeholder="Nhập lại mật khẩu mới"
                autoComplete="new-password"
                disabled={!isCodeVerified}
              />
              {errors.confirmPassword && (
                <p className="text-red-400 text-sm mt-2">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isCodeVerified}
              className="w-full cursor-pointer flex items-center justify-center rounded-lg h-14 px-5 bg-gradient-to-r from-primary to-[#a881ff] text-white text-base font-bold transition-transform active:scale-[0.98] shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
            >
              Đặt lại mật khẩu
            </button>
          </form>

          {/* Back Links */}
          <div className="flex flex-col gap-2 items-center">
            <Link
              to="/forgot-password"
              className="text-primary text-sm font-semibold hover:underline decoration-2 underline-offset-4 transition-all"
            >
              Gửi lại mã
            </Link>
            <Link
              to="/sign-in"
              className="text-white/40 text-sm font-medium hover:text-white transition-colors"
            >
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ResetPassword;
