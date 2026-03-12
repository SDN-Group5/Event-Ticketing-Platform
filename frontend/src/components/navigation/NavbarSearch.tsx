import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchInput } from '../common/Input';
import { ROUTES } from '../../constants/routes';
import { formatMoneyVND, useLayoutSearchEvents } from '../../services/searchEventsService';
import { EventCard } from '../common/Card';

type Suggestion = {
  eventId: string;
  title: string;
  location: string;
};

const getEventDateParts = (dateString: string) => {
  const date = new Date(dateString);
  return {
    date: date.getDate().toString().padStart(2, '0'),
    month: date.toLocaleString('default', { month: 'short' }),
  };
};

export const NavbarSearch: React.FC<{
  maxSuggestions?: number;
}> = ({ maxSuggestions = 8 }) => {
  const navigate = useNavigate();
  const { events, isLoading, error } = useLayoutSearchEvents();

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'categories' | 'cities'>('categories');
  const rootRef = useRef<HTMLDivElement>(null);

  const cities = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => {
      if (e.location) set.add(e.location);
    });
    return Array.from(set).slice(0, 12);
  }, [events]);

  const categories = useMemo(
    () => [
      {
        key: 'music',
        label: 'Âm nhạc',
        img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=900&q=80',
      },
      {
        key: 'sports',
        label: 'Thể thao',
        img: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=900&q=80',
      },
      {
        key: 'theatre',
        label: 'Sân khấu & Nghệ thuật',
        img: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=900&q=80',
      },
      {
        key: 'workshop',
        label: 'Hội thảo & Workshop',
        img: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=900&q=80',
      },
      {
        key: 'festival',
        label: 'Lễ hội',
        img: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=900&q=80',
      },
      {
        key: 'nightlife',
        label: 'Nightlife',
        img: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=900&q=80',
      },
    ],
    []
  );

  const trendingEvents = useMemo(() => {
    // “Xu hướng” tạm lấy các event sắp diễn ra nhất (đã được service lọc quá khứ)
    const sorted = [...events].sort((a, b) => +new Date(a.date) - +new Date(b.date));
    return sorted.slice(0, 4);
  }, [events]);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [] as Suggestion[];

    const matched = events
      .filter((e) => {
        const hay = `${e.title} ${e.location}`.toLowerCase();
        return hay.includes(q);
      })
      .slice(0, maxSuggestions)
      .map((e) => ({ eventId: e.eventId, title: e.title, location: e.location }));

    return matched;
  }, [events, maxSuggestions, query]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const submitToSearchPage = () => {
    const q = query.trim();
    if (!q) return;
    setOpen(false);
    navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(q)}`);
  };

  const selectSuggestion = (eventId: string) => {
    setOpen(false);
    setQuery('');
    navigate(`/event/${eventId}`);
  };

  const pickCity = (city: string) => {
    setOpen(false);
    navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(city)}`);
  };

  const pickCategory = (categoryLabel: string) => {
    setOpen(false);
    navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(categoryLabel)}`);
  };

  return (
    <div ref={rootRef} className="relative w-full ">
      <SearchInput
        className="w-full"
        placeholder="Tìm sự kiện, địa điểm..."
        value={query}
        onChange={(v) => {
          setQuery(v);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setOpen(false);
            return;
          }
          if (e.key === 'Enter') {
            e.preventDefault();
            submitToSearchPage();
          }
        }}
      />

      {open && (
        <div
          role="listbox"
          className={[
            'absolute z-50 mt-3 overflow-hidden',
            // Center the panel under input, but keep inside viewport
            'left-1/2 -translate-x-1/2',
            'w-[min(920px,calc(100vw-1.5rem))]',
            // Full-height feel (fit within viewport under navbar)
            'max-h-[calc(100vh-96px)]',
            'rounded-3xl border border-white/10',
            'bg-[#120d1e]/80 backdrop-blur-xl',
            'shadow-[0_20px_80px_-30px_rgba(0,0,0,0.75)]',
            'ring-1 ring-white/5',
          ].join(' ')}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setOpen(false);
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-[360px_1fr] h-full">
            {/* Left: suggestions */}
            <div className="border-b md:border-b-0 md:border-r border-white/10">
              <div className="h-full overflow-auto">
                {query.trim() === '' ? (
                  <div className="px-5 py-5 text-sm text-gray-300">
                    <div className="font-semibold text-white/90 mb-1">Gợi ý tìm kiếm</div>
                    <div className="text-gray-400">
                      Nhập từ khoá để gợi ý theo <span className="text-gray-200">sự kiện</span> /{' '}
                      <span className="text-gray-200">địa điểm</span>.
                    </div>
                  </div>
                ) : isLoading ? (
                  <div className="px-5 py-5 text-sm text-gray-400">Đang tải gợi ý…</div>
                ) : error ? (
                  <div className="px-5 py-5 text-sm text-gray-400">Không tải được dữ liệu gợi ý.</div>
                ) : (
                  <div className="py-2">
                    {suggestions.length === 0 ? (
                      <div className="px-5 py-4 text-sm text-gray-400">Không có gợi ý phù hợp.</div>
                    ) : (
                      suggestions.map((s) => (
                        <button
                          key={s.eventId}
                          type="button"
                          onClick={() => selectSuggestion(s.eventId)}
                          className="w-full text-left px-5 py-3 hover:bg-white/6 transition-colors focus:outline-none focus:bg-white/6"
                        >
                          <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-[#a59cba] mt-0.5">trending_up</span>
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-white truncate leading-5">{s.title}</div>
                              <div className="text-xs text-gray-400 truncate mt-0.5">{s.location}</div>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-white/10 bg-black/10">
                <button
                  type="button"
                  onClick={submitToSearchPage}
                  disabled={query.trim() === ''}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-gray-100 hover:border-[#8655f6]/45 hover:bg-white/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Tìm kiếm “{query.trim() || '…'}”
                </button>
              </div>
            </div>

            {/* Right: tabs */}
            <div className="bg-gradient-to-b from-white/0 to-white/6 h-full overflow-auto">
              <div className="flex items-center gap-2 px-4 pt-4">
                <button
                  type="button"
                  onClick={() => setTab('categories')}
                  className={
                    tab === 'categories'
                      ? 'px-3.5 py-2 rounded-2xl text-sm font-semibold text-white bg-white/10 border border-white/10'
                      : 'px-3.5 py-2 rounded-2xl text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/6'
                  }
                >
                  Khám phá theo Thể loại
                </button>
                <button
                  type="button"
                  onClick={() => setTab('cities')}
                  className={
                    tab === 'cities'
                      ? 'px-3.5 py-2 rounded-2xl text-sm font-semibold text-white bg-white/10 border border-white/10'
                      : 'px-3.5 py-2 rounded-2xl text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/6'
                  }
                >
                  Khám phá theo Thành phố
                </button>
              </div>

              <div className="p-4">
                {tab === 'categories' ? (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {categories.map((c) => (
                      <button
                        key={c.key}
                        type="button"
                        onClick={() => pickCategory(c.label)}
                        className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 hover:border-[#8655f6]/45 transition-all text-left"
                      >
                        <div className="absolute inset-0">
                          <img
                            src={c.img}
                            alt={c.label}
                            className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                        </div>

                        <div className="relative p-4 h-[92px] flex flex-col justify-end">
                          <div className="text-sm font-black text-white truncate drop-shadow">
                            {c.label}
                          </div>
                          <div className="text-[11px] text-gray-200/80 truncate mt-0.5">
                            Khám phá ngay
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {cities.length === 0 ? (
                      <div className="text-sm text-gray-400 px-1 py-6">
                        Chưa có dữ liệu thành phố (eventLocation) từ API.
                      </div>
                    ) : (
                      cities.map((city) => (
                        <button
                          key={city}
                          type="button"
                          onClick={() => pickCity(city)}
                          className="rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-[#8655f6]/45 transition-all p-3.5 text-left"
                        >
                          <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-white/70">location_on</span>
                            <div className="text-sm font-semibold text-white truncate">{city}</div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Trending section (reuse landing page EventCard) */}
              <div className="px-4 pb-5">
                <div className="flex items-end justify-between mb-3">
                  <div>
                    <p className="text-[#8655f6] text-xs font-bold uppercase tracking-widest">Xu hướng</p>
                    <h3 className="text-white font-display text-lg font-black">Gợi ý dành cho bạn</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(ROUTES.SEARCH)}
                    className="text-sm font-semibold text-gray-300 hover:text-white transition-colors"
                  >
                    Xem tất cả
                  </button>
                </div>

                {trendingEvents.length === 0 ? (
                  <div className="text-sm text-gray-400 py-6">Chưa có sự kiện xu hướng.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {trendingEvents.map((e) => {
                      const { date, month } = getEventDateParts(e.date || new Date().toISOString());
                      const price = e.minPrice ? `Từ ${formatMoneyVND(e.minPrice)}` : 'Miễn phí';
                      return (
                        <div key={e.eventId} className="scale-[0.92] origin-top-left">
                          <EventCard
                            title={e.title}
                            imageUrl={e.image}
                            date={date}
                            month={month}
                            price={price}
                            onBuyClick={() => {
                              setOpen(false);
                              setQuery('');
                              navigate(`/event/${e.eventId}`);
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

