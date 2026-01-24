export default function TicketVibeFooter() {
  return (
    <footer className="mt-auto border-t border-white/5 bg-[#131118] pt-12 pb-8 px-4 md:px-10">
      <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded bg-primary" />
          <span className="text-white font-bold text-lg">TicketVibe</span>
        </div>
        <p className="text-gray-500 text-sm">
          © {new Date().getFullYear()} TicketVibe Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

