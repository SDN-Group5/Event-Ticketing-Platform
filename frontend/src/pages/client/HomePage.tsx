import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { EventCard } from '../../components/common/Card';
import { LayoutAPI } from '../../services/layoutApiService';
import { EventLayout } from '../../types/layout';

const getEventDateParts = (dateString: string) => {
    try {
        const date = new Date(dateString);
        return {
            date: date.getDate().toString().padStart(2, '0'),
            month: date.toLocaleString('default', { month: 'short' })
        };
    } catch {
        return { date: '01', month: 'JAN' };
    }
};

const useScrollReveal = () => {
    const observerRef = useRef<IntersectionObserver | null>(null);
    
    const setRef = useCallback((node: HTMLDivElement | null) => {
        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        if (node) {
            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        node.classList.add('visible');
                        observer.unobserve(node);
                    }
                },
                { threshold: 0.05 }
            );
            observer.observe(node);
            observerRef.current = observer;
        }
    }, []);

    useEffect(() => {
        return () => {
            if (observerRef.current) observerRef.current.disconnect();
        };
    }, []);

    return setRef;
};

const AnimatedCounter: React.FC<{ target: number; suffix?: string; duration?: number }> = ({
    target, suffix = '', duration = 2000
}) => {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const started = useRef(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !started.current) {
                started.current = true;
                const startTime = performance.now();
                const animate = (now: number) => {
                    const elapsed = now - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    setCount(Math.floor(eased * target));
                    if (progress < 1) requestAnimationFrame(animate);
                };
                requestAnimationFrame(animate);
                observer.unobserve(el);
            }
        }, { threshold: 0.5 });
        observer.observe(el);
        return () => observer.disconnect();
    }, [target, duration]);

    return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

const CATEGORIES = [
    {
        icon: 'music_note', label: 'Âm nhạc', desc: 'Concert, Live show & DJ',
        color: 'from-purple-500 to-pink-500', glow: 'rgba(168,85,247,0.4)',
        img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&q=80',
        count: '2,400+'
    },
    {
        icon: 'sports_soccer', label: 'Thể thao', desc: 'Bóng đá, Tennis & Boxing',
        color: 'from-green-500 to-emerald-500', glow: 'rgba(10,191,120,0.4)',
        img: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=600&q=80',
        count: '1,800+'
    },
    {
        icon: 'theater_comedy', label: 'Kịch nghệ', desc: 'Nhạc kịch & Sân khấu',
        color: 'from-amber-500 to-orange-500', glow: 'rgba(245,158,11,0.4)',
        img: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=600&q=80',
        count: '960+'
    },
    {
        icon: 'mic', label: 'Hài kịch', desc: 'Stand-up & Talkshow',
        color: 'from-rose-500 to-red-500', glow: 'rgba(244,63,94,0.4)',
        img: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=600&q=80',
        count: '750+'
    },
    {
        icon: 'festival', label: 'Lễ hội', desc: 'Festival & Carnival',
        color: 'from-cyan-500 to-blue-500', glow: 'rgba(6,182,212,0.4)',
        img: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&q=80',
        count: '520+'
    },
    {
        icon: 'nightlife', label: 'Nightlife', desc: 'Club, Bar & Rooftop',
        color: 'from-violet-500 to-purple-500', glow: 'rgba(139,92,246,0.4)',
        img: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=600&q=80',
        count: '1,100+'
    },
];

const HOW_IT_WORKS = [
    { icon: 'search', title: 'Tìm sự kiện', desc: 'Khám phá hàng ngàn sự kiện đang diễn ra gần bạn hoặc trên toàn quốc.' },
    { icon: 'event_seat', title: 'Chọn chỗ ngồi', desc: 'Xem sơ đồ 3D, chọn vị trí yêu thích và đặt vé ngay lập tức.' },
    { icon: 'confirmation_number', title: 'Nhận vé điện tử', desc: 'Thanh toán an toàn, nhận e-ticket qua email và check-in nhanh chóng.' },
];

const FeaturedCarousel: React.FC<{ events: EventLayout[] }> = ({ events }) => {
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % events.length);
    }, [events.length]);

    const prevSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + events.length) % events.length);
    }, [events.length]);

    useEffect(() => {
        if (isAutoPlaying && events.length > 1) {
            timerRef.current = setInterval(nextSlide, 5000);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isAutoPlaying, nextSlide, events.length]);

    if (events.length === 0) return null;

    const currentEvent = events[currentIndex];

    return (
        <section className="px-4 md:px-10 pb-8 max-w-[1440px] mx-auto group">
            <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-slate-900/50 min-h-[400px] md:min-h-[480px]">
                {/* Carousel Slides */}
                {events.map((event, index) => (
                    <div
                        key={event.eventId}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                            }`}
                    >
                        {/* Background Image */}
                        <div className="absolute inset-0">
                            <img
                                src={event.eventImage || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30'}
                                alt={event.eventName}
                                className={`w-full h-full object-cover transition-transform duration-[5000ms] ${index === currentIndex ? 'scale-110' : 'scale-100'
                                    }`}
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-[#151022] via-[#151022]/80 to-transparent" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#151022] via-transparent to-transparent" />
                        </div>

                        {/* Content */}
                        <div className="relative z-20 flex flex-col justify-end h-full p-8 md:p-14 md:pb-16 max-w-4xl">
                            <div className={`transition-all duration-700 delay-300 transform ${index === currentIndex ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                                }`}>
                                <span className="inline-flex items-center gap-2 w-fit py-1.5 px-3 rounded-full bg-[#8655f6]/20 border border-[#8655f6]/30 text-xs font-bold uppercase tracking-wider text-[#c084fc] mb-4">
                                    <span className="material-symbols-outlined text-[14px] filled">star</span>
                                    Sự kiện nổi bật
                                </span>
                                <h3 className="font-display text-3xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight drop-shadow-2xl">
                                    {event.eventName || 'Untitled Event'}
                                </h3>
                                <div className="flex flex-wrap items-center gap-5 text-gray-200 text-sm md:text-base mb-8 font-medium">
                                    {event.eventDate && (
                                        <span className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[20px] text-[#8655f6]">calendar_month</span>
                                            {new Date(event.eventDate).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        </span>
                                    )}
                                    {event.eventLocation && (
                                        <span className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[20px] text-[#8655f6]">location_on</span>
                                            {event.eventLocation}
                                        </span>
                                    )}
                                    {event.minPrice != null && (
                                        <span className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[20px] text-[#8655f6]">sell</span>
                                            Từ ${event.minPrice}
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={() => navigate(`/event/${event.eventId}`)}
                                    className="w-fit h-14 px-8 rounded-2xl bg-gradient-to-r from-[#8655f6] to-[#7c3aed] text-white text-lg font-bold shadow-[0_10px_40px_rgba(137,90,246,0.4)] hover:shadow-[0_15px_50px_rgba(137,90,246,0.6)] transition-all duration-300 hover:-translate-y-1 flex items-center gap-3 active:scale-95"
                                >
                                    <span>Mua vé ngay</span>
                                    <span className="material-symbols-outlined text-[22px]">arrow_forward</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Navigation Arrows */}
                {events.length > 1 && (
                    <>
                        <button
                            onClick={(e) => { e.stopPropagation(); prevSlide(); setIsAutoPlaying(false); }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/20 hover:bg-white/10 border border-white/5 backdrop-blur-md text-white flex items-center justify-center transition-all duration-300 transform opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-90"
                        >
                            <span className="material-symbols-outlined">chevron_left</span>
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); nextSlide(); setIsAutoPlaying(false); }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/20 hover:bg-white/10 border border-white/5 backdrop-blur-md text-white flex items-center justify-center transition-all duration-300 transform opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-90"
                        >
                            <span className="material-symbols-outlined">chevron_right</span>
                        </button>
                    </>
                )}

                {/* Indicators */}
                {events.length > 1 && (
                    <div className="absolute bottom-8 right-8 md:right-14 z-30 flex gap-2.5">
                        {events.map((_, index) => (
                            <button
                                key={index}
                                onClick={(e) => { e.stopPropagation(); setCurrentIndex(index); setIsAutoPlaying(false); }}
                                className={`h-1.5 transition-all duration-500 rounded-full ${index === currentIndex
                                        ? 'w-8 bg-[#8655f6]'
                                        : 'w-2 bg-white/30 hover:bg-white/50'
                                    }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState<EventLayout[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const categoriesRef = useScrollReveal();
    const featuredRef = useScrollReveal();
    const trendingRef = useScrollReveal();
    const howItWorksRef = useScrollReveal();
    const ctaRef = useScrollReveal();

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const layouts = await LayoutAPI.getAllLayouts();
                setEvents(layouts);
            } catch (err) {
                console.error('Failed to fetch events:', err);
                setError('Failed to load events. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const handleSearch = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        navigate('/search');
    }, [navigate]);

    const featuredEvents = events.slice(0, 5);

    return (
        <>
            {/* ==================== HERO SECTION ==================== */}
            <div className="relative w-full min-h-[75vh] flex items-center justify-center overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#151022]/40 via-[#151022]/70 to-[#151022] z-10" />
                    <img
                        alt="Concert"
                        className="w-full h-full object-cover opacity-60"
                        src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1920&q=80"
                    />
                </div>

                {/* Floating Orbs */}
                <div className="absolute top-20 left-[10%] w-72 h-72 rounded-full bg-[#8655f6]/20 blur-[120px] animate-float-orb pointer-events-none" />
                <div className="absolute bottom-20 right-[15%] w-96 h-96 rounded-full bg-[#d946ef]/15 blur-[150px] animate-float-orb-slow pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#8655f6]/10 blur-[200px] pointer-events-none" />

                {/* Hero Content */}
                <div className="relative z-20 flex flex-col items-center text-center max-w-5xl px-6 pt-20 pb-20">
                    <span className="animate-hero-text inline-flex items-center gap-2 py-2 px-4 rounded-full bg-white/10 border border-white/10 backdrop-blur-md text-xs font-bold uppercase tracking-widest text-[#c084fc] mb-8 shadow-[0_0_30px_rgba(137,90,246,0.25)]">
                        <span className="w-2 h-2 rounded-full bg-[#d946ef] animate-pulse" />
                        Nền tảng bán vé #1 Việt Nam
                    </span>

                    <h1 className="animate-hero-text-delay font-display text-white text-5xl sm:text-6xl md:text-8xl font-black leading-[1.05] tracking-tight mb-6">
                        Trải nghiệm
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8655f6] via-[#c084fc] to-[#d946ef] animate-gradient">
                            Sự kiện Live
                        </span>
                    </h1>

                    <p className="animate-hero-text-delay-2 text-gray-300/90 text-lg md:text-xl font-normal max-w-2xl mb-10 leading-relaxed">
                        Từ concert underground đến stadium tour, tìm kiếm & đặt vé cho hàng ngàn sự kiện đang chờ bạn.
                    </p>

                    <div className="animate-hero-text-delay-3 flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => navigate('/search')}
                            className="group h-14 px-8 rounded-2xl bg-gradient-to-r from-[#8655f6] to-[#7c3aed] text-white text-base font-bold shadow-[0_0_50px_rgba(137,90,246,0.5)] hover:shadow-[0_0_70px_rgba(137,90,246,0.7)] transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-3"
                        >
                            <span>Khám phá sự kiện</span>
                            <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </button>
                        <button
                            onClick={() => {
                                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="h-14 px-8 rounded-2xl bg-white/5 border border-white/15 text-white text-base font-semibold backdrop-blur-md hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[20px]">play_circle</span>
                            <span>Cách hoạt động</span>
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="animate-hero-text-delay-3 mt-16 grid grid-cols-3 gap-8 md:gap-16">
                        {[
                            { value: 10000, suffix: '+', label: 'Sự kiện' },
                            { value: 500000, suffix: '+', label: 'Vé đã bán' },
                            { value: 99, suffix: '%', label: 'Hài lòng' },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center">
                                <p className="text-2xl md:text-4xl font-black text-white">
                                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                                </p>
                                <p className="text-xs md:text-sm text-gray-400 mt-1 font-medium">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ==================== FILTER BAR ==================== */}
            <div className="relative z-30 px-4 -mt-12 mb-12">
                <div className="max-w-[1100px] mx-auto glass-panel rounded-2xl p-4 md:p-5 shadow-2xl border border-white/10 bg-[#1e293b]/60 backdrop-blur-xl">
                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-4 relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8655f6]">
                                <span className="material-symbols-outlined">event_note</span>
                            </div>
                            <input
                                className="w-full h-14 bg-[#131118] border border-[#2d2839] text-white rounded-xl pl-12 pr-4 focus:ring-2 focus:ring-[#8655f6]/50 focus:border-[#8655f6] placeholder:text-gray-500 transition-all"
                                placeholder="Tên sự kiện hoặc nghệ sĩ..."
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="md:col-span-3 relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8655f6]">
                                <span className="material-symbols-outlined">location_on</span>
                            </div>
                            <select className="w-full h-14 bg-[#131118] border border-[#2d2839] text-white rounded-xl pl-12 pr-10 focus:ring-2 focus:ring-[#8655f6]/50 focus:border-[#8655f6] appearance-none transition-all">
                                <option>Tất cả thành phố</option>
                                <option>Hồ Chí Minh</option>
                                <option>Hà Nội</option>
                                <option>Đà Nẵng</option>
                            </select>
                        </div>
                        <div className="md:col-span-3 relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8655f6]">
                                <span className="material-symbols-outlined">calendar_month</span>
                            </div>
                            <input
                                className="w-full h-14 bg-[#131118] border border-[#2d2839] text-white rounded-xl pl-12 pr-4 focus:ring-2 focus:ring-[#8655f6]/50 focus:border-[#8655f6] transition-all"
                                type="date"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <button
                                type="submit"
                                className="w-full h-14 bg-gradient-to-r from-[#8655f6] to-[#7c3aed] text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 hover:shadow-[0_5px_30px_rgba(137,90,246,0.5)] transition-all duration-300 hover:-translate-y-0.5"
                            >
                                <span className="material-symbols-outlined">search</span>
                                <span>Tìm kiếm</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* ==================== CATEGORIES ==================== */}
            <section ref={categoriesRef} className="reveal relative px-4 md:px-10 py-16 md:py-20 max-w-[1440px] mx-auto overflow-hidden">
                {/* Section background decoration */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#8655f6]/[0.04] blur-[150px] pointer-events-none" />

                <div className="relative z-10">
                    <div className="text-center mb-10">
                        <p className="text-[#8655f6] text-sm font-bold uppercase tracking-widest mb-3">Danh mục</p>
                        <h2 className="font-display text-3xl md:text-4xl font-black text-white mb-3">Khám phá theo thể loại</h2>
                        <p className="text-gray-500 max-w-md mx-auto text-sm">Chọn thể loại yêu thích và tìm ngay sự kiện phù hợp với bạn</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.label}
                                onClick={() => navigate('/search')}
                                className="group relative flex flex-col rounded-2xl overflow-hidden border border-white/[0.06] hover:border-white/20 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_60px_-15px_var(--glow)]"
                                style={{ '--glow': cat.glow } as React.CSSProperties}
                            >
                                {/* Background image */}
                                <div className="relative h-32 sm:h-36 overflow-hidden">
                                    <img
                                        src={cat.img}
                                        alt={cat.label}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#151022] via-[#151022]/60 to-transparent" />

                                    {/* Glow orb on hover */}
                                    <div
                                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                        style={{ background: `radial-gradient(circle at 50% 80%, ${cat.glow}, transparent 70%)` }}
                                    />

                                    {/* Icon floating */}
                                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-lg`}>
                                            <span className="material-symbols-outlined text-white text-[18px]">{cat.icon}</span>
                                        </div>
                                    </div>

                                    {/* Event count badge */}
                                    <div className="absolute top-3 left-3">
                                        <span className="text-[10px] font-bold text-white/70 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full">
                                            {cat.count} sự kiện
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="relative p-4 bg-[#151022]/80 backdrop-blur-sm flex-1 flex flex-col">
                                    <div className="flex items-center gap-2.5 mb-1.5">
                                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-md flex-shrink-0 group-hover:shadow-[0_0_20px_var(--glow)] transition-shadow duration-500`}>
                                            <span className="material-symbols-outlined text-white text-[16px]">{cat.icon}</span>
                                        </div>
                                        <h3 className="text-sm font-bold text-white group-hover:text-white transition-colors">{cat.label}</h3>
                                    </div>
                                    <p className="text-[11px] text-gray-500 group-hover:text-gray-400 transition-colors leading-relaxed">{cat.desc}</p>

                                    {/* Arrow indicator */}
                                    <div className="mt-auto pt-3 flex items-center gap-1 text-[11px] font-semibold text-[#8655f6] opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-8px] group-hover:translate-x-0">
                                        <span>Khám phá</span>
                                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* ==================== FEATURED EVENT CAROUSEL ==================== */}
            <div ref={featuredRef} className={`reveal py-16 ${featuredEvents.length === 0 ? 'hidden' : ''}`}>
                <FeaturedCarousel events={featuredEvents} />
            </div>

            {/* ==================== TRENDING NOW ==================== */}
            <section ref={trendingRef} className="reveal w-full px-4 md:px-10 py-16 md:py-20 max-w-[1440px] mx-auto">
                <div>
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <p className="text-[#8655f6] text-sm font-bold uppercase tracking-widest mb-3">Xu hướng</p>
                            <h2 className="font-display text-3xl md:text-4xl font-black text-white">Sự kiện hot nhất</h2>
                        </div>
                        <button
                            onClick={() => navigate('/search')}
                            className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-[#8655f6] hover:text-[#c084fc] transition-colors"
                        >
                            Xem tất cả
                            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </button>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="rounded-2xl bg-white/5 border border-white/5 overflow-hidden">
                                    <div className="aspect-[4/3] bg-white/5 animate-pulse" />
                                    <div className="p-5 space-y-3">
                                        <div className="h-5 bg-white/5 rounded-lg animate-pulse w-3/4" />
                                        <div className="h-4 bg-white/5 rounded-lg animate-pulse w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-400 py-12 bg-white/5 rounded-2xl border border-red-500/20">
                            <span className="material-symbols-outlined text-4xl mb-3 block">error</span>
                            <p className="mb-4">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors font-medium"
                            >
                                Thử lại
                            </button>
                        </div>
                    ) : events.length === 0 ? (
                        <div className="text-center text-gray-400 py-12 bg-white/5 rounded-2xl border border-white/10">
                            <span className="material-symbols-outlined text-5xl mb-3 block text-gray-500">event_busy</span>
                            <p className="text-lg font-medium">Chưa có sự kiện nào</p>
                            <p className="text-sm text-gray-500 mt-1">Hãy quay lại sau nhé!</p>
                        </div>
                    ) : (
                        <div className="stagger-children visible grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {events.slice(0, 8).map((item) => {
                                const { date, month } = getEventDateParts(item.eventDate || new Date().toISOString());
                                return (
                                    <EventCard
                                        key={item.eventId}
                                        title={item.eventName || 'Untitled Event'}
                                        imageUrl={item.eventImage || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30'}
                                        date={date}
                                        month={month}
                                        price={item.minPrice ? `Từ $${item.minPrice}` : 'Miễn phí'}
                                        onBuyClick={() => navigate(`/event/${item.eventId}`)}
                                    />
                                );
                            })}
                        </div>
                    )}

                    <div className="md:hidden mt-6 text-center">
                        <button
                            onClick={() => navigate('/search')}
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#8655f6] hover:text-[#c084fc] transition-colors"
                        >
                            Xem tất cả sự kiện
                            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* ==================== HOW IT WORKS ==================== */}
            <section id="how-it-works" ref={howItWorksRef} className="reveal px-4 md:px-10 py-16 md:py-20 max-w-[1440px] mx-auto">
                <div>
                    <div className="text-center mb-10">
                        <p className="text-[#8655f6] text-sm font-bold uppercase tracking-widest mb-3">Hướng dẫn</p>
                        <h2 className="font-display text-3xl md:text-4xl font-black text-white mb-4">Đặt vé dễ dàng trong 3 bước</h2>
                        <p className="text-gray-400 max-w-xl mx-auto">Chỉ cần vài phút để tìm và đặt vé cho sự kiện yêu thích của bạn.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        {HOW_IT_WORKS.map((step, i) => (
                            <div key={step.title} className="relative group">
                                <div className="flex flex-col items-center text-center p-8 rounded-3xl bg-white/[0.03] border border-white/[0.06] hover:border-[#8655f6]/30 hover:bg-white/[0.06] transition-all duration-300">
                                    <div className="absolute -top-4 -right-2 w-10 h-10 rounded-full bg-[#8655f6]/10 border border-[#8655f6]/20 flex items-center justify-center text-sm font-black text-[#8655f6]">
                                        {i + 1}
                                    </div>
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8655f6] to-[#d946ef] flex items-center justify-center mb-5 shadow-[0_0_30px_rgba(137,90,246,0.3)] group-hover:shadow-[0_0_40px_rgba(137,90,246,0.5)] transition-shadow duration-300">
                                        <span className="material-symbols-outlined text-white text-[32px]">{step.icon}</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                                    <p className="text-sm text-gray-400 leading-relaxed">{step.desc}</p>
                                </div>
                                {i < HOW_IT_WORKS.length - 1 && (
                                    <div className="hidden md:block absolute top-1/2 -right-4 md:-right-5 text-[#8655f6]/30">
                                        <span className="material-symbols-outlined text-[28px]">chevron_right</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ==================== CTA SECTION ==================== */}
            <section ref={ctaRef} className="reveal px-4 md:px-10 py-16 md:py-20 max-w-[1440px] mx-auto">
                <div>
                    <div className="relative rounded-3xl overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#8655f6] via-[#7c3aed] to-[#d946ef] animate-gradient" />
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

                        <div className="relative z-10 flex flex-col items-center text-center py-16 md:py-20 px-6">
                            <h2 className="font-display text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
                                Sẵn sàng cho trải nghiệm<br />không thể quên?
                            </h2>
                            <p className="text-white/80 text-lg max-w-xl mb-8 leading-relaxed">
                                Đừng bỏ lỡ bất kỳ sự kiện nào. Đặt vé ngay hôm nay và tạo nên những kỷ niệm đáng nhớ!
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={() => navigate('/search')}
                                    className="h-14 px-8 rounded-2xl bg-white text-[#7c3aed] font-bold text-base shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex items-center gap-2"
                                >
                                    <span>Bắt đầu ngay</span>
                                    <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
                                </button>
                                <button
                                    onClick={() => navigate('/register')}
                                    className="h-14 px-8 rounded-2xl bg-white/15 border border-white/25 text-white font-bold text-base hover:bg-white/25 transition-all duration-300 hover:-translate-y-1"
                                >
                                    Tạo tài khoản miễn phí
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ==================== FOOTER ==================== */}
            <footer className="border-t border-white/5 bg-[#0c0a14]">
                <div className="max-w-[1440px] mx-auto px-4 md:px-10 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                        <div className="md:col-span-1">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex items-center justify-center size-10 rounded-lg bg-gradient-to-br from-[#8655f6] to-[#d946ef] text-white shadow-[0_0_15px_rgba(137,90,246,0.5)]">
                                    <span className="material-symbols-outlined text-[24px]">confirmation_number</span>
                                </div>
                                <h2 className="font-display text-white text-xl font-bold tracking-tight">TicketVibe</h2>
                            </div>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Nền tảng bán vé sự kiện hàng đầu. An toàn, nhanh chóng và đáng tin cậy.
                            </p>
                        </div>

                        <div>
                            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Sản phẩm</h4>
                            <ul className="space-y-2.5">
                                {['Sự kiện', 'Thể thao', 'Âm nhạc', 'Kịch nghệ'].map((item) => (
                                    <li key={item}>
                                        <button onClick={() => navigate('/search')} className="text-sm text-gray-500 hover:text-white transition-colors">
                                            {item}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Hỗ trợ</h4>
                            <ul className="space-y-2.5">
                                {['Trung tâm trợ giúp', 'Liên hệ', 'Chính sách hoàn tiền', 'Điều khoản'].map((item) => (
                                    <li key={item}>
                                        <button className="text-sm text-gray-500 hover:text-white transition-colors">
                                            {item}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Dành cho tổ chức</h4>
                            <ul className="space-y-2.5">
                                {['Tạo sự kiện', 'Bảng điều khiển', 'Phân tích', 'API'].map((item) => (
                                    <li key={item}>
                                        <button className="text-sm text-gray-500 hover:text-white transition-colors">
                                            {item}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="mt-10 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-xs text-gray-600">&copy; 2026 TicketVibe. All rights reserved.</p>
                        <div className="flex items-center gap-4">
                            {['Facebook', 'Instagram', 'Twitter'].map((social) => (
                                <button key={social} className="text-xs text-gray-600 hover:text-white transition-colors">
                                    {social}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
};
