import EventCard from "./EventCard";

const TRENDING = [
  {
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDi6Oy71QOrOhpI-eEIZzHCZiMS_yadvN2UnsBAJsc0c9onFTs33e__ir4YWKaYR6eM-SDx4P9LmTzvTfsjNZ9DeRiTs97ZsBA6xSbHFhbu__IpgbqKDQ5AoKI6LL13YZQO-uKaKWYpRDe1Z2yfGY4HZU3DTsc68i27BNEhYnNebUw1ty7S9Qx6n1LG7aO2ruJdhaWzl8zC0KLUYm2ILm8ZxUWXNhcq72VRo79cKc3NBeZSrp43nmH9skeO7byVQjk2AtdTux1kRS8y",
    title: "Midnight Bass Festival",
    subtitle: "feat. Skrillex, Diplo",
    location: "SECC, District 7, HCMC",
    month: "Oct",
    day: "24",
    price: "500k VND",
  },
  {
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAh2nqKN4dfkx_cnZP0iEoY6bSjZJ2uWrgMWMWS5wh7Z9fTX6PgHxZ7ky5mQfWkEdEf0qDNz9UCg4T7FksyVeOsLxyiFiMmDLFdMnaEpnfhOJF2l0dwITFrO7s4pabD4_nJ0rV9j3ACNr_0BY65jkg7nkXJaT5JPZq1nPyXaahJ0kdvQXQvsdG9RzjP-_nXJsfSFXouAfy45ZUVDd4TrMzlqVYGdR5nhExRtrP2CilHZc_zB_j_JBySSP5jZLzAsdGntY9ORv_A_ji8",
    title: "Neon Nights Tour",
    subtitle: "The Weeknd",
    location: "My Dinh Stadium, Hanoi",
    month: "Nov",
    day: "02",
    price: "1.2m VND",
  },
  {
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBFKPgI3neKtoFLBwPHGnnXGqo02lVoYR8smPkzZuw0v4uA8i-ElOrDFw3nBgytl9QfPLf4Pstk9Xr87Q1H1zO8zJAkmSvi65XrvvQ3_J2K6hxLWyihYprE53gPYkq4-nBrlOlpcdRj6YHFO4kVOCAMtR8XmWbVTzOofALc4ublWwNmICgw-dPzj8QaR9_KNLQmmZtmwRgA6lfF6rje9LCkNVsW8WtobqNNm3J1NQVmWBxqrj0gEaUujGxQRVcZyweFCpNZ0x-LZvHW",
    title: "Acoustic Sunday",
    subtitle: "Indie Artists Collection",
    location: "The Observatory, HCMC",
    month: "Nov",
    day: "15",
    price: "250k VND",
  },
  {
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDNvJZmi9V4NuAXXmRFmR0AQBPcNn93Q0QeSAH3yrkfuos3hgrksYSMjDa7mZAWddPAMZxnJfFeaskiVRgn84KM10C65miITV1ibQkM0oOkkPix9aXLuqYx675Lzu2us2zqH1vX3Z5sBTWQOnfqsmS3Rn0QRJ9p5ZxQuOlyaqzcfXB6mm0eOF5CCg93H8m7vVHwA69_vZFchTwmfpwF3K_n4YD4S-Pj2Uhzj5_ueN6yB8YrbPeS3ObDyQ0cuHbzHlOrq74TJhWOQFGF",
    title: "Rock Symphony",
    subtitle: "The Walls, Buc Tuong",
    location: "Hoa Binh Theater, HCMC",
    month: "Dec",
    day: "05",
    price: "800k VND",
  },
] as const;

export default function TrendingSection() {
  return (
    <section className="w-full px-4 md:px-10 pb-20 max-w-[1440px] mx-auto">
      <div className="flex items-end justify-between mb-8 px-2">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Trending Now</h2>
          <p className="text-gray-400">Don't miss out on these selling-out events</p>
        </div>
        <button
          type="button"
          className="hidden md:flex items-center gap-1 text-primary font-semibold hover:text-white transition-colors"
        >
          View All{" "}
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {TRENDING.map((e) => (
          <EventCard key={`${e.title}-${e.day}`} {...e} />
        ))}
      </div>
    </section>
  );
}

