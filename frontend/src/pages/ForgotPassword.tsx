import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutationWithLoading } from "../hooks/useLoadingHooks";
import * as apiClient from "../api-client";
import useAppContext from "../hooks/useAppContext";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { z } from "zod";

const forgotPasswordSchema = z.object({
    email: z.string().email("Email không hợp lệ"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword = () => {
    const { showToast } = useAppContext();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const [submittedEmail, setSubmittedEmail] = useState("");

    const mutation = useMutationWithLoading(apiClient.forgotPassword, {
        onSuccess: (data) => {
            showToast({
                title: "Email đã được gửi",
                description: data.message || "Vui lòng kiểm tra email để nhận mã reset password.",
                type: "SUCCESS",
            });

            // Redirect đến reset password page với email
            setTimeout(() => {
                navigate(`/reset-password?email=${encodeURIComponent(submittedEmail)}`);
            }, 500);
        },
        onError: (error: Error) => {
            showToast({
                title: "Lỗi",
                description: error.message,
                type: "ERROR",
            });
        },
        loadingMessage: "Đang gửi email...",
    });

    const onSubmit = handleSubmit((data) => {
        setSubmittedEmail(data.email);
        mutation.mutate(data);
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
                        Quên mật khẩu?
                    </h1>
                    <p className="text-white/60 text-base font-normal leading-relaxed text-center pb-8">
                        Nhập email của bạn và chúng tôi sẽ gửi mã reset password đến email của bạn.
                    </p>

                    {/* Form */}
                    <form onSubmit={onSubmit} className="w-full">
                        <div className="mb-6">
                            <label
                                htmlFor="email"
                                className="block text-white text-sm font-medium mb-2"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                {...register("email")}
                                className="w-full h-14 px-4 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-0 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                placeholder="your.email@example.com"
                                autoComplete="email"
                            />
                            {errors.email && (
                                <p className="text-red-400 text-sm mt-2">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className="w-full cursor-pointer flex items-center justify-center rounded-lg h-14 px-5 bg-gradient-to-r from-primary to-[#a881ff] text-white text-base font-bold transition-transform active:scale-[0.98] shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
                        >
                            {mutation.isPending ? "Đang gửi..." : "Gửi mã reset"}
                        </button>
                    </form>

                    {/* Back to Sign In */}
                    <Link
                        to="/sign-in"
                        className="text-primary text-sm font-semibold hover:underline decoration-2 underline-offset-4 transition-all"
                    >
                        Quay lại đăng nhập
                    </Link>
                </div>

                {/* Footer */}
                <p className="mt-8 text-center text-white/30 text-xs">
                    Chưa có tài khoản?{" "}
                    <Link to="/register" className="text-white/50 hover:text-white underline">
                        Đăng ký ngay
                    </Link>
                </p>
            </div>
        </main>
    );
};

export default ForgotPassword;
