import HeroSection from "../components/common/landing/HeroSection";
import FilterBar from "../components/common/landing/FilterBar";
import TrendingSection from "../components/common/landing/TrendingSection";

export default function LandingPage() {
    return (
        <div className="min-h-screen flex flex-col bg-background-dark">
            <HeroSection />

            {/* Floating filter bar giống thiết kế TicketVibe */}
            <section className="relative z-30 px-4 -mt-16 md:-mt-20 mb-12">
                <div className="max-w-[1100px] mx-auto">
                    <div className="glass-panel rounded-2xl p-4 shadow-[0_24px_80px_rgba(0,0,0,0.75)] border border-white/10">
                        <FilterBar />
                    </div>
                </div>
            </section>

            <TrendingSection />
        </div>
    );
}

