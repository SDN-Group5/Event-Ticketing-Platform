export default function FilterBar() {
    return (
        <form className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Event Input */}
            <div className="md:col-span-4 relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary">
                    <span className="material-symbols-outlined">event_note</span>
                </div>
                <input
                    className="w-full h-14 bg-[#131118] border border-[#2d2839] text-white rounded-xl pl-12 pr-4 focus:ring-2 focus:ring-primary/50 focus:border-transparent placeholder:text-gray-500 transition-all"
                    placeholder="Event or Artist"
                    type="text"
                />
            </div>

            {/* Location Select */}
            <div className="md:col-span-3 relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary">
                    <span className="material-symbols-outlined">location_on</span>
                </div>
                <select className="w-full h-14 bg-[#131118] border border-[#2d2839] text-white rounded-xl pl-12 pr-10 focus:ring-2 focus:ring-primary/50 focus:border-transparent appearance-none cursor-pointer">
                    <option>Ho Chi Minh City</option>
                    <option>Hanoi</option>
                    <option>Da Nang</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                    <span className="material-symbols-outlined">expand_more</span>
                </div>
            </div>

            {/* Date Input */}
            <div className="md:col-span-3 relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary">
                    <span className="material-symbols-outlined">calendar_month</span>
                </div>
                <input
                    className="w-full h-14 bg-[#131118] border border-[#2d2839] text-white rounded-xl pl-12 pr-4 focus:ring-2 focus:ring-primary/50 focus:border-transparent uppercase text-sm cursor-pointer"
                    type="date"
                />
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2">
                <button
                    className="w-full h-14 text-white font-bold rounded-xl
          bg-gradient-to-r from-[#8655f6] via-[#a855f7] to-[#d946ef]
          shadow-[0_14px_40px_-16px_rgba(134,85,246,0.8)]
          hover:shadow-[0_18px_55px_-16px_rgba(217,70,239,0.85)]
          hover:-translate-y-0.5 active:scale-[0.99]
          transition-all flex items-center justify-center gap-2"
                    type="button"
                >
                    <span className="material-symbols-outlined">search</span>
                    <span>Search</span>
                </button>
            </div>
        </form>
    );
}

