import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserAPI } from '../../services/userApiService';
import type { UserRole } from '../../../../shared/type';

type MeUser = {
    _id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    avatar?: string | null;
    role?: UserRole;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        country?: string;
        zipCode?: string;
    };
    isActive?: boolean;
    emailVerified?: boolean;
    createdAt?: string;
};

const ROLE_LABEL: Record<UserRole, string> = {
    customer: 'Khách hàng',
    organizer: 'Nhà tổ chức',
    staff: 'Nhân viên',
    admin: 'Quản trị',
};

function formatMemberSince(iso?: string): string {
    if (!iso) return '—';
    try {
        return new Date(iso).toLocaleDateString('vi-VN', {
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return '—';
    }
}

function formatAddress(addr?: MeUser['address']): string {
    if (!addr) return '';
    const parts = [addr.street, addr.city, addr.state, addr.country, addr.zipCode].filter(Boolean);
    return parts.join(', ');
}

export const ProfilePage: React.FC = () => {
    const { user: authUser } = useAuth();
    const [me, setMe] = useState<MeUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const data = await UserAPI.getMe();
                if (!cancelled) setMe(data as MeUser);
            } catch (e: unknown) {
                const msg =
                    (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                    'Không tải được thông tin hồ sơ.';
                if (!cancelled) setLoadError(msg);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const displayName = useMemo(() => {
        const fromApi = `${me?.firstName ?? ''} ${me?.lastName ?? ''}`.trim();
        if (fromApi) return fromApi;
        if (authUser?.name) return authUser.name;
        return me?.email || authUser?.email || 'Người dùng';
    }, [me, authUser]);

    const email = me?.email ?? authUser?.email ?? '—';
    const phone = me?.phone?.trim() || '—';
    const addressLine = formatAddress(me?.address) || '—';
    const role = (me?.role ?? authUser?.role) as UserRole | undefined;
    const roleLabel = role ? ROLE_LABEL[role] ?? role : '—';
    const avatarUrl = me?.avatar || authUser?.avatar || null;
    const memberSince = formatMemberSince(me?.createdAt);

    const avatarStyle = avatarUrl
        ? { backgroundImage: `url(${avatarUrl})` as const }
        : undefined;

    return (
        <div className="min-h-screen bg-[#0f172a] text-white">
            <main className="p-8 overflow-y-auto max-w-3xl mx-auto w-full">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
                    <div className="flex items-center gap-6">
                        <div
                            className="w-20 h-20 rounded-full border-4 border-[#8655f6]/30 bg-gray-700 bg-cover bg-center shrink-0 flex items-center justify-center text-2xl font-bold text-white/90"
                            style={avatarStyle}
                        >
                            {!avatarUrl && displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold flex flex-wrap items-center gap-2">
                                {displayName}
                                {role && (
                                    <span className="text-[10px] bg-[#8655f6]/20 text-[#8655f6] px-2 py-0.5 rounded-full border border-[#8655f6]/30 uppercase tracking-wide">
                                        {roleLabel}
                                    </span>
                                )}
                            </h1>
                            <p className="text-sm text-slate-400">Thành viên từ {memberSince}</p>
                            <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
                                {me?.emailVerified === false && (
                                    <span className="text-amber-400/90">Email chưa xác thực</span>
                                )}
                                {me?.isActive === false && (
                                    <span className="text-red-400/90">Tài khoản đang tạm khóa</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {loading && (
                    <p className="text-slate-400 text-sm">Đang tải thông tin hồ sơ…</p>
                )}
                {loadError && !loading && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        {loadError}
                    </div>
                )}

                {!loading && !loadError && (
                    <>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-[#8655f6] rounded-full" />
                            Thông tin tài khoản
                        </h2>
                        <div className="grid gap-4 max-w-2xl">
                            {[
                                { label: 'Email', value: email },
                                { label: 'Số điện thoại', value: phone },
                                { label: 'Địa chỉ', value: addressLine },
                            ].map((row) => (
                                <div
                                    key={row.label}
                                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4"
                                >
                                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 sm:w-40 shrink-0">
                                        {row.label}
                                    </span>
                                    <span className="text-sm text-white break-all">{row.value}</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};
