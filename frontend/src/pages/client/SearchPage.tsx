import React, { useEffect, useMemo, useReducer } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { EventCard } from '../../components/common/Card';
import { formatMoneyVND, useLayoutSearchEvents } from '../../services/searchEventsService';

const getEventDateParts = (dateString: string) => {
    const date = new Date(dateString);
    return {
        date: date.getDate().toString().padStart(2, '0'),
        month: date.toLocaleString('default', { month: 'short' })
    };
};

export const SearchPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    type SortBy = 'relevance' | 'date_asc' | 'price_asc' | 'price_desc';
    type FiltersState = {
        searchTerm: string;
        selectedLocation: 'all' | string;
        priceMin: string;
        priceMax: string;
        sortBy: SortBy;
    };

    const initialFilters: FiltersState = {
        searchTerm: '',
        selectedLocation: 'all',
        priceMin: '',
        priceMax: '',
        sortBy: 'relevance',
    };

    type State = {
        draft: FiltersState;
        applied: FiltersState;
        page: number;
    };

    type Action =
        | { type: 'draft/setSearchTerm'; value: string }
        | { type: 'draft/setLocation'; value: string }
        | { type: 'draft/setPriceMin'; value: string }
        | { type: 'draft/setPriceMax'; value: string }
        | { type: 'draft/setSortBy'; value: SortBy }
        | { type: 'apply' }
        | { type: 'reset' }
        | { type: 'page/set'; value: number };

    const [state, dispatch] = useReducer(
        (s: State, a: Action): State => {
            switch (a.type) {
                case 'draft/setSearchTerm':
                    return { ...s, draft: { ...s.draft, searchTerm: a.value } };
                case 'draft/setLocation':
                    return { ...s, draft: { ...s.draft, selectedLocation: a.value } };
                case 'draft/setPriceMin':
                    return { ...s, draft: { ...s.draft, priceMin: a.value } };
                case 'draft/setPriceMax':
                    return { ...s, draft: { ...s.draft, priceMax: a.value } };
                case 'draft/setSortBy':
                    return { ...s, draft: { ...s.draft, sortBy: a.value } };
                case 'apply':
                    return { ...s, applied: { ...s.draft }, page: 1 };
                case 'reset':
                    return { draft: initialFilters, applied: initialFilters, page: 1 };
                case 'page/set':
                    return { ...s, page: Math.max(1, Math.floor(a.value || 1)) };
                default:
                    return s;
            }
        },
        { draft: initialFilters, applied: initialFilters, page: 1 }
    );

    const { draft, applied, page } = state;
    const pageSize = 9;

    const { events: publishedEvents, isLoading, error } = useLayoutSearchEvents();

    // Sync from URL query: /search?q=...
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const q = (params.get('q') ?? '').trim();
        if (!q) return;

        // Only update if different from current applied query
        if (applied.searchTerm.trim() === q) return;

        dispatch({ type: 'draft/setSearchTerm', value: q });
        dispatch({ type: 'apply' });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search]);

    const locations = useMemo(() => {
        const set = new Set<string>();
        publishedEvents.forEach((e) => set.add(e.location));
        return Array.from(set);
    }, [publishedEvents]);

    const priceBounds = useMemo(() => {
        const prices = publishedEvents
            .map((e) => e.minPrice)
            .filter((p): p is number => typeof p === 'number' && !Number.isNaN(p));
        const dataMin = prices.length === 0 ? 0 : Math.min(...prices);
        const dataMax = prices.length === 0 ? 100 : Math.max(...prices);

        // Cho slider "nhiều tiền" hơn: nới khung max tối thiểu 1,000,000 và làm tròn đẹp
        const min = Math.max(0, Math.floor(dataMin / 10_000) * 10_000);
        const max = Math.max(1_000_000, Math.ceil(dataMax / 10_000) * 10_000);

        return { min, max };
    }, [publishedEvents]);

    const priceStep = useMemo(() => {
        const span = priceBounds.max - priceBounds.min;
        if (span >= 5_000_000) return 100_000;
        if (span >= 1_000_000) return 50_000;
        if (span >= 200_000) return 10_000;
        return 1_000;
    }, [priceBounds.max, priceBounds.min]);

    const priceRange = useMemo(() => {
        const minRaw = draft.priceMin === '' ? priceBounds.min : Number(draft.priceMin);
        const maxRaw = draft.priceMax === '' ? priceBounds.max : Number(draft.priceMax);
        const min = Number.isFinite(minRaw) ? minRaw : priceBounds.min;
        const max = Number.isFinite(maxRaw) ? maxRaw : priceBounds.max;
        return {
            min: Math.max(priceBounds.min, Math.min(min, max)),
            max: Math.min(priceBounds.max, Math.max(max, min)),
        };
    }, [draft.priceMax, draft.priceMin, priceBounds.max, priceBounds.min]);

    const filteredEvents = useMemo(() => {
        const q = applied.searchTerm.trim().toLowerCase();
        const min = applied.priceMin === '' ? null : Number(applied.priceMin);
        const max = applied.priceMax === '' ? null : Number(applied.priceMax);

        const base = publishedEvents.filter((e) => {
            const okQuery =
                q === '' ||
                e.title.toLowerCase().includes(q) ||
                e.description.toLowerCase().includes(q) ||
                e.location.toLowerCase().includes(q);

            const okLocation = applied.selectedLocation === 'all' || e.location === applied.selectedLocation;

            const okMin = min === null || Number.isNaN(min) ? true : e.minPrice >= min;
            const okMax = max === null || Number.isNaN(max) ? true : e.minPrice <= max;

            return okQuery && okLocation && okMin && okMax;
        });

        const sorted = [...base];
        sorted.sort((a, b) => {
            if (applied.sortBy === 'date_asc') return +new Date(a.date) - +new Date(b.date);
            if (applied.sortBy === 'price_asc') return a.minPrice - b.minPrice;
            if (applied.sortBy === 'price_desc') return b.minPrice - a.minPrice;
            return 0;
        });
        return sorted;
    }, [applied.priceMax, applied.priceMin, applied.searchTerm, applied.selectedLocation, applied.sortBy, publishedEvents]);

    const totalPages = useMemo(() => {
        return Math.max(1, Math.ceil(filteredEvents.length / pageSize));
    }, [filteredEvents.length]);

    useEffect(() => {
        if (page > totalPages) dispatch({ type: 'page/set', value: totalPages });
    }, [totalPages]);

    const pagedEvents = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredEvents.slice(start, start + pageSize);
    }, [filteredEvents, page]);

    const paginationWindow = useMemo(() => {
        const maxButtons = 5;
        const half = Math.floor(maxButtons / 2);
        let start = Math.max(1, page - half);
        let end = Math.min(totalPages, start + maxButtons - 1);
        start = Math.max(1, end - maxButtons + 1);
        return { start, end };
    }, [page, totalPages]);

    const resetAll = () => {
        dispatch({ type: 'reset' });
    };

    const applyFilters = () => {
        dispatch({ type: 'apply' });
    };

    return (
        <div className="min-h-screen bg-[#0a0c10] text-white p-6 md:p-8">
            <div className="max-w-[1440px] mx-auto flex gap-8">
                <aside className="w-72 flex-col gap-6 shrink-0 h-fit sticky top-8 hidden lg:flex">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">Dashboard</h2>
                        <button
                            type="button"
                            onClick={resetAll}
                            className="text-[#ec4899] text-xs font-bold uppercase hover:underline"
                        >
                            Reset All
                        </button>
                    </div>

                    <div className="border-b border-[#1e232b] pb-6">
                        <h3 className="text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#a855f7]">location_on</span>
                            Location
                        </h3>
                        <select
                            value={draft.selectedLocation}
                            onChange={(e) => dispatch({ type: 'draft/setLocation', value: e.target.value })}
                            className="w-full bg-[#0f1218] rounded-xl p-3 border border-[#1e232b] text-sm outline-none focus:border-[#a855f7]/60"
                        >
                            <option value="all">All locations</option>
                            {locations.map((loc) => (
                                <option key={loc} value={loc}>
                                    {loc}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="border-b border-[#1e232b] pb-6">
                        <h3 className="text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#a855f7]">payments</span>
                            Price (min ticket)
                        </h3>
                        <div className="bg-[#0f1218] rounded-xl p-4 border border-[#1e232b]">
                            <div className="flex items-center justify-between text-xs text-gray-300 mb-3">
                                <span>
                                            Min: <span className="text-white font-semibold">{formatMoneyVND(priceRange.min)}</span>
                                </span>
                                <span>
                                            Max: <span className="text-white font-semibold">{formatMoneyVND(priceRange.max)}</span>
                                </span>
                            </div>

                            <div className="relative h-10">
                                <input
                                    type="range"
                                    min={priceBounds.min}
                                    max={priceBounds.max}
                                    step={priceStep}
                                    value={priceRange.min}
                                    onChange={(e) => {
                                        const next = Number(e.target.value);
                                        const clamped = Math.min(next, priceRange.max);
                                        dispatch({ type: 'draft/setPriceMin', value: String(clamped) });
                                        if (draft.priceMax === '') dispatch({ type: 'draft/setPriceMax', value: String(priceRange.max) });
                                    }}
                                    className="absolute inset-0 w-full accent-[#a855f7]"
                                />
                                <input
                                    type="range"
                                    min={priceBounds.min}
                                    max={priceBounds.max}
                                    step={priceStep}
                                    value={priceRange.max}
                                    onChange={(e) => {
                                        const next = Number(e.target.value);
                                        const clamped = Math.max(next, priceRange.min);
                                        dispatch({ type: 'draft/setPriceMax', value: String(clamped) });
                                        if (draft.priceMin === '') dispatch({ type: 'draft/setPriceMin', value: String(priceRange.min) });
                                    }}
                                    className="absolute inset-0 w-full accent-[#ec4899]"
                                />
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-gray-500 mt-2">
                                        <span>{formatMoneyVND(priceBounds.min)}</span>
                                        <span>{formatMoneyVND(priceBounds.max)}</span>
                            </div>
                        </div>
                    </div>
                </aside>

                <section className="flex-1">
                    <div className="flex flex-col gap-4 mb-8">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-black mb-1">
                                    Search <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a855f7] to-[#ec4899]">Events</span>
                                </h1>
                                <p className="text-gray-400 font-medium">
                                    {isLoading ? 'Đang tải dữ liệu...' : `${filteredEvents.length} / ${publishedEvents.length} events found`}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <select
                                    value={draft.sortBy}
                                    onChange={(e) => dispatch({ type: 'draft/setSortBy', value: e.target.value as any })}
                                    className="bg-[#0f1218] rounded-xl px-3 py-2 border border-[#1e232b] text-sm outline-none focus:border-[#a855f7]/60"
                                >
                                    <option value="relevance">Relevance</option>
                                    <option value="date_asc">Date (soonest)</option>
                                    <option value="price_asc">Price (low → high)</option>
                                    <option value="price_desc">Price (high → low)</option>
                                </select>
                                <button
                                    type="button"
                                    onClick={applyFilters}
                                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#a855f7] to-[#ec4899] text-white text-sm font-bold hover:opacity-90"
                                >
                                    Apply
                                </button>
                                <button
                                    type="button"
                                    onClick={resetAll}
                                    className="lg:hidden px-3 py-2 rounded-xl border border-[#ec4899]/50 text-[#ec4899] text-sm font-semibold hover:bg-[#ec4899]/10"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>

                        <div className="bg-[#0f1218] rounded-2xl border border-[#1e232b] p-4">
                            <div className="flex flex-col md:flex-row gap-3">
                                <div className="flex-1 relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        search
                                    </span>
                                    <input
                                        value={draft.searchTerm}
                                        onChange={(e) => dispatch({ type: 'draft/setSearchTerm', value: e.target.value })}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') applyFilters();
                                        }}
                                        placeholder="Tìm theo tên, mô tả, hoặc địa điểm..."
                                        className="w-full bg-transparent rounded-xl pl-11 pr-4 py-3 border border-[#1e232b] text-sm outline-none focus:border-[#a855f7]/60"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3 lg:hidden">
                                    <select
                                        value={draft.selectedLocation}
                                        onChange={(e) => dispatch({ type: 'draft/setLocation', value: e.target.value })}
                                        className="bg-transparent rounded-xl px-3 py-3 border border-[#1e232b] text-sm outline-none focus:border-[#a855f7]/60"
                                    >
                                        <option value="all">All locations</option>
                                        {locations.map((loc) => (
                                            <option key={loc} value={loc}>
                                                {loc}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="bg-transparent rounded-xl px-3 py-2 border border-[#1e232b]">
                                        <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1">
                                            <span>Max</span>
                                                <span className="text-gray-200 font-semibold">{formatMoneyVND(priceRange.max)}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min={priceBounds.min}
                                            max={priceBounds.max}
                                            step={priceStep}
                                            value={priceRange.max}
                                            onChange={(e) => {
                                                const next = Number(e.target.value);
                                                const clamped = Math.max(next, priceRange.min);
                                                dispatch({ type: 'draft/setPriceMax', value: String(clamped) });
                                                if (draft.priceMin === '') dispatch({ type: 'draft/setPriceMin', value: String(priceRange.min) });
                                            }}
                                            className="w-full accent-[#ec4899]"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {error ? (
                        <div className="bg-[#0f1218] rounded-2xl border border-[#1e232b] p-8 text-center">
                            <p className="text-gray-200 font-semibold mb-2">Không tải được dữ liệu từ API</p>
                            <p className="text-sm text-gray-400 break-words">{error}</p>
                        </div>
                    ) : isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="rounded-2xl border border-white/5 bg-white/5 overflow-hidden animate-pulse"
                                >
                                    <div className="aspect-[4/3] bg-white/10" />
                                    <div className="p-5 space-y-3">
                                        <div className="h-5 bg-white/10 rounded" />
                                        <div className="h-4 bg-white/10 rounded w-2/3" />
                                        <div className="h-10 bg-white/10 rounded mt-6" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredEvents.length === 0 ? (
                        <div className="bg-[#0f1218] rounded-2xl border border-[#1e232b] p-8 text-center text-gray-300">
                            Không có event nào khớp bộ lọc. Thử bấm <span className="text-white font-semibold">Reset</span> nhé.
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {pagedEvents.map((item) => {
                                    const { date, month } = getEventDateParts(item.date);
                                    return (
                                        <EventCard
                                            key={item.eventId}
                                            title={item.title}
                                            imageUrl={item.image}
                                            date={date}
                                            month={month}
                                            price={`From $${item.minPrice}`}
                                            onBuyClick={() => navigate(`/event/${item.eventId}`)}
                                        />
                                    );
                                })}
                            </div>

                            {totalPages > 1 && (
                                <div className="mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div className="text-sm text-gray-400">
                                        Showing{' '}
                                        <span className="text-gray-200 font-semibold">
                                            {(page - 1) * pageSize + 1}
                                        </span>
                                        {' '}to{' '}
                                        <span className="text-gray-200 font-semibold">
                                            {Math.min(page * pageSize, filteredEvents.length)}
                                        </span>
                                        {' '}of{' '}
                                        <span className="text-gray-200 font-semibold">{filteredEvents.length}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => dispatch({ type: 'page/set', value: page - 1 })}
                                            disabled={page === 1}
                                            className="px-3 py-2 rounded-xl border border-[#1e232b] bg-[#0f1218] text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#a855f7]/60"
                                        >
                                            Prev
                                        </button>

                                        {paginationWindow.start > 1 && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => dispatch({ type: 'page/set', value: 1 })}
                                                    className="w-10 h-10 rounded-xl border border-[#1e232b] bg-[#0f1218] text-sm hover:border-[#a855f7]/60"
                                                >
                                                    1
                                                </button>
                                                <span className="text-gray-500 px-1">…</span>
                                            </>
                                        )}

                                        {Array.from(
                                            { length: paginationWindow.end - paginationWindow.start + 1 },
                                            (_, i) => paginationWindow.start + i
                                        ).map((p) => (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() => dispatch({ type: 'page/set', value: p })}
                                                className={
                                                    p === page
                                                        ? 'w-10 h-10 rounded-xl bg-gradient-to-r from-[#a855f7] to-[#ec4899] text-white text-sm font-bold'
                                                        : 'w-10 h-10 rounded-xl border border-[#1e232b] bg-[#0f1218] text-sm hover:border-[#a855f7]/60'
                                                }
                                            >
                                                {p}
                                            </button>
                                        ))}

                                        {paginationWindow.end < totalPages && (
                                            <>
                                                <span className="text-gray-500 px-1">…</span>
                                                <button
                                                    type="button"
                                                    onClick={() => dispatch({ type: 'page/set', value: totalPages })}
                                                    className="w-10 h-10 rounded-xl border border-[#1e232b] bg-[#0f1218] text-sm hover:border-[#a855f7]/60"
                                                >
                                                    {totalPages}
                                                </button>
                                            </>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => dispatch({ type: 'page/set', value: page + 1 })}
                                            disabled={page === totalPages}
                                            className="px-3 py-2 rounded-xl border border-[#1e232b] bg-[#0f1218] text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#a855f7]/60"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </section>
            </div>
        </div>
    );
};
