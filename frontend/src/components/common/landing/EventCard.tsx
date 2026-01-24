type EventCardProps = {
  imageUrl: string;
  title: string;
  subtitle: string;
  location: string;
  month: string;
  day: string;
  price: string;
};

export default function EventCard(props: EventCardProps) {
  const { imageUrl, title, subtitle, location, month, day, price } = props;

  return (
    <div className="glass-card rounded-2xl overflow-hidden group/card flex flex-col h-full">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110"
          src={imageUrl}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent opacity-60" />

        {/* Date Badge */}
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg p-2 text-center min-w-[60px]">
          <p className="text-xs font-bold text-primary uppercase">{month}</p>
          <p className="text-xl font-bold text-white leading-none">{day}</p>
        </div>

        {/* Like Button */}
        <button
          type="button"
          className="absolute top-3 right-3 p-2 rounded-full bg-black/40 hover:bg-white/20 text-white transition-colors backdrop-blur-sm"
        >
          <span className="material-symbols-outlined text-[20px]">favorite</span>
        </button>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-white mb-1 line-clamp-1 group-hover/card:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-gray-400 text-sm mb-4">{subtitle}</p>

        <div className="mt-auto space-y-3">
          <div className="flex items-center gap-2 text-gray-300 text-sm">
            <span className="material-symbols-outlined text-primary text-[18px]">
              location_on
            </span>
            <span className="truncate">{location}</span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <div>
              <p className="text-xs text-gray-400">Starting from</p>
              <p className="text-lg font-bold text-white">{price}</p>
            </div>
            <button
              type="button"
              className="px-4 py-2 rounded-lg text-sm font-bold text-white
              bg-gradient-to-r from-[#8655f6] via-[#a855f7] to-[#d946ef]
              shadow-[0_12px_30px_-14px_rgba(134,85,246,0.85)]
              group-hover/card:shadow-[0_16px_40px_-14px_rgba(217,70,239,0.9)]
              hover:-translate-y-0.5 active:scale-[0.98]
              transition-all"
            >
              Buy Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

