export default function HeroSection() {
    return (
        <section className="relative w-full min-h-[600px] flex items-center justify-center overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/80 to-transparent z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-background-dark/90 via-transparent to-background-dark/90 z-10" />
                <img
                    alt="Massive energetic concert crowd with laser lights and stage effects"
                    className="w-full h-full object-cover opacity-80"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDT7K98ACs9vSfWQJt6l98gKBFXGVc38ShpjT8RCOhtRLtf6Ln3C9-S-dqANQv7H0a4rbWE1B9NP8y1e109gSd0Zj_-MkAHP6hPYeoklUrPg6VTM-f_KsMk_CLC6nO7gJ4Crv28pUo9DVBTVA5pK0lR34RTkxamij83oLj22VJKOdD0dCkS2oKWxtBEJONPQ1Z6cJD5TKpb4BYwGwcgPnKglqMo5W_z-2Sd7VzM0wGBqJM0mKQ-knGZaMM0KFyud3hDkWe-FGeHw4Ft"
                />
            </div>

            {/* Content */}
            <div className="relative z-20 flex flex-col items-center text-center max-w-4xl px-4 pt-10 pb-20">
                <span className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-white/10 border border-white/10 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-primary mb-6 shadow-[0_0_20px_rgba(137,90,246,0.3)]">
                    <span className="w-2 h-2 rounded-full bg-neon-pink animate-pulse" />
                    Live Now
                </span>
                <h1 className="text-white text-5xl md:text-7xl font-black leading-[1.1] tracking-tight mb-6 drop-shadow-2xl">
                    Experience the <br />
                    <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-white via-[#8655f6] to-[#d946ef]">
                        Music Live
                    </span>
                </h1>
                <p className="text-gray-300 text-lg md:text-xl font-normal max-w-2xl mb-10 leading-relaxed">
                    Secure your spot at the hottest events this season. From underground
                    raves to stadium tours, feel the beat of the city.
                </p>
                <button
                    className="h-14 px-10 rounded-xl text-white text-base font-bold
          bg-gradient-to-r from-[#8655f6] via-[#a855f7] to-[#d946ef]
          shadow-[0_18px_45px_-18px_rgba(134,85,246,0.85)]
          hover:shadow-[0_22px_65px_-18px_rgba(217,70,239,0.85)]
          hover:-translate-y-0.5 active:scale-[0.99]
          transition-all flex items-center gap-2"
                >
                    <span>Book Now</span>
                    <span className="material-symbols-outlined text-[20px]">
                        arrow_forward
                    </span>
                </button>
            </div>

            {/* Decorative Gradients */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background-dark to-transparent z-10" />
            <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 -right-32 w-96 h-96 bg-neon-pink/10 rounded-full blur-[120px] pointer-events-none" />
        </section>
    );
}

