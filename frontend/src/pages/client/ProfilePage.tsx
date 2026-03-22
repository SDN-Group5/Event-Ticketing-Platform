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
        return new Date(iso).toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' });
    } catch {
        return '—';
    }
}

function extractErrMsg(e: unknown): string {
    return (
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (e instanceof Error ? e.message : 'Đã xảy ra lỗi.')
    );
}

const inputCls =
    'w-full bg-slate-800/60 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#8655f6]/60 transition-colors';
const labelCls = 'block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1';
const btnPrimary =
    'px-5 py-2 rounded-lg bg-[#8655f6] text-sm font-bold text-white hover:bg-[#7640e0] disabled:opacity-40 disabled:cursor-not-allowed transition-colors';
const btnGhost =
    'px-5 py-2 rounded-lg border border-white/10 text-sm font-medium text-slate-300 hover:bg-white/5 transition-colors';

export const ProfilePage: React.FC = () => {
    const { user: authUser } = useAuth();

    const [me, setMe] = useState<MeUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    // Edit profile
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', street: '', city: '', country: '' });
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null);

    // Change password
    const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
    const [pwSaving, setPwSaving] = useState(false);
    const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const data = await UserAPI.getMe();
                if (!cancelled) setMe(data as MeUser);
            } catch (e: unknown) {
                if (!cancelled) setLoadError(extractErrMsg(e));
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    // Sync form khi me thay đổi
    useEffect(() => {
        if (me) {
            setForm({
                firstName: me.firstName ?? '',
                lastName: me.lastName ?? '',
                phone: me.phone ?? '',
                street: me.address?.street ?? '',
                city: me.address?.city ?? '',
                country: me.address?.country ?? '',
            });
        }
    }, [me]);

    const displayName = useMemo(() => {
        const fromApi = `${me?.firstName ?? ''} ${me?.lastName ?? ''}`.trim();
        return fromApi || authUser?.name || me?.email || authUser?.email || 'Người dùng';
    }, [me, authUser]);

    const email = me?.email ?? authUser?.email ?? '—';
    const role = (me?.role ?? authUser?.role) as UserRole | undefined;
    const roleLabel = role ? ROLE_LABEL[role] ?? role : '—';
    const avatarUrl = me?.avatar || authUser?.avatar || null;
    const memberSince = formatMemberSince(me?.createdAt);
    const avatarStyle = avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : undefined;

    // ---- handlers ----
    const handleSaveProfile = async () => {
        setSaving(true);
        setSaveMsg(null);

        const nameRegex = /^[\p{L}\s'-]+$/u;
        const fnTrimmed = form.firstName.trim();
        const lnTrimmed = form.lastName.trim();
        if (!fnTrimmed || fnTrimmed.length < 2 || fnTrimmed.length > 10 || !nameRegex.test(fnTrimmed)) {
            setSaveMsg({ ok: false, text: 'Họ không hợp lệ (2-10 ký tự, chỉ chữ cái, khoảng trắng, dấu gạch ngang)' });
            setSaving(false);
            return;
        }
        if (!lnTrimmed || lnTrimmed.length < 2 || lnTrimmed.length > 10 || !nameRegex.test(lnTrimmed)) {
            setSaveMsg({ ok: false, text: 'Tên không hợp lệ (2-10 ký tự, chỉ chữ cái, khoảng trắng, dấu gạch ngang)' });
            setSaving(false);
            return;
        }

        try {
            const payload: any = {
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                phone: form.phone.trim(),
                address: { street: form.street.trim(), city: form.city.trim(), country: form.country.trim() },
            };
            const res = await UserAPI.updateMe(payload);
            setMe(res.user ?? res);
            setEditing(false);
            setSaveMsg({ ok: true, text: 'Cập nhật thành công!' });
        } catch (e) {
            setSaveMsg({ ok: false, text: extractErrMsg(e) });
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        setPwMsg(null);
        if (!pwForm.current || !pwForm.next) {
            setPwMsg({ ok: false, text: 'Vui lòng nhập đầy đủ.' });
            return;
        }
        if (pwForm.next.length < 6) {
            setPwMsg({ ok: false, text: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
            return;
        }
        if (pwForm.next !== pwForm.confirm) {
            setPwMsg({ ok: false, text: 'Xác nhận mật khẩu không khớp.' });
            return;
        }
        setPwSaving(true);
        try {
            await UserAPI.changePassword(pwForm.current, pwForm.next);
            setPwMsg({ ok: true, text: 'Đổi mật khẩu thành công!' });
            setPwForm({ current: '', next: '', confirm: '' });
        } catch (e) {
            setPwMsg({ ok: false, text: extractErrMsg(e) });
        } finally {
            setPwSaving(false);
        }
    };

    // ---- render ----
    return (
        <div className="min-h-screen bg-[#0f172a] text-white">
            <main className="p-6 sm:p-8 overflow-y-auto max-w-3xl mx-auto w-full space-y-8">
                {/* Header card */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center gap-6">
                    <div className="flex items-center gap-6 flex-1 min-w-0">
                        <div
                            className="w-20 h-20 rounded-full border-4 border-[#8655f6]/30 bg-gray-700 bg-cover bg-center shrink-0 flex items-center justify-center text-2xl font-bold text-white/90"
                            style={avatarStyle}
                        >
                            {!avatarUrl && displayName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-2xl font-bold flex flex-wrap items-center gap-2">
                                {displayName}
                                {role && (
                                    <span className="text-[10px] bg-[#8655f6]/20 text-[#8655f6] px-2 py-0.5 rounded-full border border-[#8655f6]/30 uppercase tracking-wide">
                                        {roleLabel}
                                    </span>
                                )}
                            </h1>
                            <p className="text-sm text-slate-400">Thành viên từ {memberSince}</p>
                            <div className="flex flex-wrap gap-3 mt-1 text-xs">
                                {me?.emailVerified === false && <span className="text-amber-400/90">Email chưa xác thực</span>}
                                {me?.isActive === false && <span className="text-red-400/90">Tài khoản đang tạm khóa</span>}
                            </div>
                        </div>
                    </div>
                </div>

                {loading && <p className="text-slate-400 text-sm">Đang tải thông tin hồ sơ…</p>}
                {loadError && !loading && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{loadError}</div>
                )}

                {!loading && !loadError && (
                    <>
                        {/* ---- Thông tin cá nhân ---- */}
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <span className="w-1.5 h-6 bg-[#8655f6] rounded-full" />
                                    Thông tin cá nhân
                                </h2>
                                {!editing && (
                                    <button className={btnGhost} onClick={() => { setEditing(true); setSaveMsg(null); }}>
                                        Chỉnh sửa
                                    </button>
                                )}
                            </div>

                            {!editing ? (
                                <div className="grid gap-3 max-w-2xl">
                                    {[
                                        { label: 'Email', value: email },
                                        { label: 'Họ', value: me?.firstName || '—' },
                                        { label: 'Tên', value: me?.lastName || '—' },
                                        { label: 'Số điện thoại', value: me?.phone || '—' },
                                        { label: 'Địa chỉ', value: [me?.address?.street, me?.address?.city, me?.address?.country].filter(Boolean).join(', ') || '—' },
                                    ].map((r) => (
                                        <div key={r.label} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                                            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 sm:w-36 shrink-0">{r.label}</span>
                                            <span className="text-sm text-white break-all">{r.value}</span>
                                        </div>
                                    ))}
                                    {saveMsg && (
                                        <p className={`text-sm mt-1 ${saveMsg.ok ? 'text-emerald-400' : 'text-red-400'}`}>{saveMsg.text}</p>
                                    )}
                                </div>
                            ) : (
                                <div className="grid gap-4 max-w-2xl bg-white/5 border border-white/10 rounded-xl p-5">
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelCls}>Họ</label>
                                            <input className={inputCls} maxLength={10} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className={labelCls}>Tên</label>
                                            <input className={inputCls} maxLength={10} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelCls}>Số điện thoại</label>
                                        <input className={inputCls} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0901 234 567" />
                                    </div>
                                    <div className="grid sm:grid-cols-3 gap-4">
                                        <div className="sm:col-span-1">
                                            <label className={labelCls}>Đường</label>
                                            <input className={inputCls} value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className={labelCls}>Thành phố</label>
                                            <input className={inputCls} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className={labelCls}>Quốc gia</label>
                                            <input className={inputCls} value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
                                        </div>
                                    </div>

                                    {saveMsg && (
                                        <p className={`text-sm ${saveMsg.ok ? 'text-emerald-400' : 'text-red-400'}`}>{saveMsg.text}</p>
                                    )}

                                    <div className="flex gap-3 pt-2">
                                        <button className={btnPrimary} disabled={saving} onClick={handleSaveProfile}>
                                            {saving ? 'Đang lưu…' : 'Lưu thay đổi'}
                                        </button>
                                        <button className={btnGhost} disabled={saving} onClick={() => { setEditing(false); setSaveMsg(null); }}>
                                            Hủy
                                        </button>
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* ---- Đổi mật khẩu ---- */}
                        <section>
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-[#8655f6] rounded-full" />
                                Đổi mật khẩu
                            </h2>
                            <div className="grid gap-4 max-w-md bg-white/5 border border-white/10 rounded-xl p-5">
                                <div>
                                    <label className={labelCls}>Mật khẩu hiện tại</label>
                                    <input
                                        type="password"
                                        className={inputCls}
                                        value={pwForm.current}
                                        onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className={labelCls}>Mật khẩu mới</label>
                                    <input
                                        type="password"
                                        className={inputCls}
                                        value={pwForm.next}
                                        onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })}
                                        placeholder="Ít nhất 6 ký tự"
                                    />
                                </div>
                                <div>
                                    <label className={labelCls}>Xác nhận mật khẩu mới</label>
                                    <input
                                        type="password"
                                        className={inputCls}
                                        value={pwForm.confirm}
                                        onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                                    />
                                </div>

                                {pwMsg && (
                                    <p className={`text-sm ${pwMsg.ok ? 'text-emerald-400' : 'text-red-400'}`}>{pwMsg.text}</p>
                                )}

                                <button className={btnPrimary + ' w-fit'} disabled={pwSaving} onClick={handleChangePassword}>
                                    {pwSaving ? 'Đang xử lý…' : 'Đổi mật khẩu'}
                                </button>
                            </div>
                        </section>
                    </>
                )}
            </main>
        </div>
    );
};
