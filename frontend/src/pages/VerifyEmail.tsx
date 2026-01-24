import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import * as apiClient from "../api-client";
import useAppContext from "../hooks/useAppContext";

const VerifyEmail = () => {
  const { showToast } = useAppContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [codeDigits, setCodeDigits] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(59);

  const email = useMemo(
    () => searchParams.get("email") || "",
    [searchParams]
  );

  useEffect(() => {
    if (!email) {
      navigate("/register");
    }
  }, [email, navigate]);

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(
      () => setResendCountdown((prev) => (prev > 0 ? prev - 1 : 0)),
      1000
    );
    return () => clearInterval(timer);
  }, [resendCountdown]);

  const handleChangeDigit = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const next = [...codeDigits];
    next[index] = value;
    setCodeDigits(next);

    if (value && index < 5) {
      const nextInput = document.getElementById(
        `otp-${index + 1}`
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
        `otp-${index - 1}`
      ) as HTMLInputElement | null;
      prevInput?.focus();
    }
  };

  const code = codeDigits.join("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email || code.length !== 6) {
      showToast({
        title: "Invalid Code",
        description: "Please enter the 6-digit code sent to your email.",
        type: "ERROR",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await apiClient.verifyEmail({ email, code });
      showToast({
        title: "Email Verified",
        description:
          "Your email has been verified successfully. You can now sign in.",
        type: "SUCCESS",
      });
      navigate("/sign-in");
    } catch (error: any) {
      showToast({
        title: "Verification Failed",
        description: error?.message || "Unable to verify email.",
        type: "ERROR",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email || resendCountdown > 0) return;
    try {
      setIsResending(true);
      await apiClient.resendVerification({ email });
      showToast({
        title: "Code Sent",
        description: "A new verification code has been sent to your email.",
        type: "SUCCESS",
      });
      setResendCountdown(59);
    } catch (error: any) {
      showToast({
        title: "Resend Failed",
        description: error?.message || "Unable to resend code.",
        type: "ERROR",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden bg-background-dark">
      {/* Abstract Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] -z-10" />

      <div className="layout-content-container flex flex-col max-w-[520px] w-full">
        <div className="glass-card p-10 md:p-14 rounded-xl flex flex-col items-center shadow-2xl">
          {/* Neon Mail Icon */}
          <div className="mb-8 p-6 bg-primary/10 rounded-full">
            <span className="material-symbols-outlined text-primary text-6xl block">
              mark_email_unread
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-white tracking-tight text-3xl font-bold leading-tight text-center pb-3">
            Verify Your Email
          </h1>
          <p className="text-white/60 text-base font-normal leading-relaxed text-center pb-8">
            We&apos;ve sent a 6-digit code to{" "}
            <span className="text-white font-medium">{email}</span>. Enter it
            below to activate your account and start booking.
          </p>

          {/* OTP Input */}
          <form onSubmit={handleSubmit} className="w-full">
            <div className="flex justify-center w-full mb-8">
              <fieldset className="relative flex gap-3 md:gap-4">
                {codeDigits.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChangeDigit(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="otp-input flex h-14 w-11 md:w-14 text-center bg-white/5 border border-white/10 rounded-lg text-white text-xl font-bold focus:outline-0 transition-all"
                    placeholder="·"
                  />
                ))}
              </fieldset>
            </div>

            {/* Primary Action */}
            <div className="w-full mb-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full cursor-pointer flex items-center justify-center rounded-lg h-14 px-5 bg-gradient-to-r from-primary to-[#a881ff] text-white text-base font-bold transition-transform active:scale-[0.98] shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Verifying..." : "Verify & Proceed"}
              </button>
            </div>
          </form>

          {/* Secondary Actions */}
          <div className="flex flex-col gap-4 items-center">
            <button
              type="button"
              disabled={resendCountdown > 0 || isResending}
              onClick={handleResend}
              className="text-white/40 text-sm font-medium hover:text-white transition-colors flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Resend Code
              <span className="text-primary/60">
                {resendCountdown > 0 ? `(${resendCountdown}s)` : ""}
              </span>
            </button>
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-primary text-sm font-semibold hover:underline decoration-2 underline-offset-4 transition-all"
            >
              Change Email Address
            </button>
          </div>
        </div>

        {/* Footer Small Print */}
        <p className="mt-8 text-center text-white/30 text-xs">
          Need help?{" "}
          <a className="text-white/50 hover:text-white underline" href="#">
            Contact TicketVibe support
          </a>
        </p>
      </div>
    </main>
  );
};

export default VerifyEmail;