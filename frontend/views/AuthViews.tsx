import React from 'react';

export const Login: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#8655f6]/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#ec4899]/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="w-full max-w-md bg-[#1e293b]/40 backdrop-blur-xl border border-white/10 p-10 rounded-3xl shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-slate-400">Please enter your details to sign in</p>
        </div>
        <form className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Email Address</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">mail</span>
              <input type="email" placeholder="name@example.com" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 text-white focus:ring-2 focus:ring-[#8655f6] focus:border-transparent placeholder-slate-500" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Password</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">lock</span>
              <input type="password" placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 text-white focus:ring-2 focus:ring-[#8655f6] focus:border-transparent placeholder-slate-500" />
            </div>
          </div>
          <button className="w-full py-4 bg-gradient-to-r from-[#8655f6] to-[#d946ef] text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-all">Login</button>
        </form>
        <div className="mt-8 text-center text-sm text-slate-400">
          Don't have an account? <a href="#" className="text-[#8655f6] hover:underline">Sign up</a>
        </div>
      </div>
    </div>
  );
}

export const OTP: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="w-full max-w-[440px] bg-[#1e293b]/70 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center shadow-2xl">
        <div className="w-16 h-16 bg-[#a855f7]/20 rounded-full flex items-center justify-center mx-auto mb-6 text-[#a855f7]">
          <span className="material-symbols-outlined text-4xl">mark_email_read</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Email Verification</h2>
        <p className="text-slate-400 text-sm mb-8">We've sent a 6-digit numeric code to <br/><span className="text-white">alex.smith@example.com</span></p>
        <div className="flex gap-2 justify-center mb-8">
          {[4,8,2,0,0,0].map((num, i) => (
            <input key={i} type="text" value={num} className="w-12 h-14 bg-slate-900/50 border border-slate-700 rounded-lg text-center text-xl font-bold text-white focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7]" readOnly />
          ))}
        </div>
        <button className="w-full py-3 bg-gradient-to-r from-[#a855f7] to-[#ec4899] rounded-lg text-white font-bold hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all">Verify Account</button>
      </div>
    </div>
  );
}

export const ResetPassword: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="w-full max-w-md bg-[#1e293b]/40 backdrop-blur border border-white/10 p-10 rounded-3xl">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 bg-[#8655f6]/10 rounded-2xl items-center justify-center mb-4 text-[#8655f6]">
            <span className="material-symbols-outlined text-3xl">lock_reset</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Reset Password</h1>
          <p className="text-slate-400 text-sm mt-2">Enter your email and we will send you instructions.</p>
        </div>
        <form className="space-y-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">mail</span>
            <input type="email" placeholder="name@example.com" className="w-full bg-[#1e293b] border border-white/10 rounded-xl py-3.5 pl-12 text-white focus:border-[#8655f6] focus:ring-[#8655f6]" />
          </div>
          <button className="w-full py-4 bg-gradient-to-r from-[#8655f6] to-[#d946ef] text-white font-bold rounded-xl">Send Reset Link</button>
        </form>
        <div className="mt-8 text-center">
          <a href="#" className="text-slate-400 hover:text-white text-sm flex items-center justify-center gap-2"><span className="material-symbols-outlined text-sm">arrow_back</span> Back to Login</a>
        </div>
      </div>
    </div>
  );
}

export const LogoutModal: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center shadow-2xl">
        <div className="mb-6 relative inline-block">
          <div className="absolute inset-0 bg-[#ec4899]/20 rounded-full blur-xl"></div>
          <div className="relative w-16 h-16 bg-[#ec4899]/10 rounded-2xl flex items-center justify-center border border-[#ec4899]/20 text-[#ec4899]">
            <span className="material-symbols-outlined text-3xl">logout</span>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Are you sure you want to log out?</h2>
        <p className="text-slate-400 text-sm mb-8">You will need to login again to access your tickets.</p>
        <div className="flex flex-col gap-3">
          <button className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#ec4899] to-[#be185d] text-white font-bold shadow-lg shadow-[#ec4899]/20">LOG OUT</button>
          <button className="w-full py-3.5 rounded-xl border border-white/10 text-slate-300 font-medium hover:bg-white/5">Cancel</button>
        </div>
      </div>
    </div>
  );
}