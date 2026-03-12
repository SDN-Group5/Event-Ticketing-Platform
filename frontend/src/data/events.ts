// Mock events data for demo flows (search, zone selection, layout editor)

export interface MockEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image: string;
  organizerId: string;
  seatMapId: string;
  minPrice: number;
  maxPrice: number;
  status: 'published' | 'draft';
}

export const eventsData: MockEvent[] = [
  {
    id: '1',
    title: 'The Grand Symphony',
    description: 'An evening of classical masterpieces performed by the National Orchestra.',
    date: '2026-03-15T19:00:00',
    location: 'Grand Hall',
    image:
      'https://images.unsplash.com/photo-1465847899078-b413929f71b1?auto=format&fit=crop&q=80&w=1000',
    organizerId: 'u2',
    seatMapId: 'sm1',
    minPrice: 50,
    maxPrice: 200,
    status: 'published',
  },
  {
    id: '2',
    title: 'Rock Fest 2026',
    description: 'The biggest rock festival of the year featuring top bands.',
    date: '2026-04-20T16:00:00',
    location: 'Open Air Stadium',
    image:
      'https://images.unsplash.com/photo-1459749411177-8c2755cc0d53?auto=format&fit=crop&q=80&w=1000',
    organizerId: 'u2',
    seatMapId: 'sm2',
    minPrice: 80,
    maxPrice: 350,
    status: 'published',
  },
  {
    id: '3',
    title: 'Cyber Tech Conference',
    description: 'Future technology trends and networking.',
    date: '2026-05-10T09:00:00',
    location: 'Tech Convention Center',
    image:
      'https://images.unsplash.com/photo-1540575467063-178a50918e7f?auto=format&fit=crop&q=80&w=1000',
    organizerId: 'u2',
    seatMapId: 'sm3',
    minPrice: 150,
    maxPrice: 500,
    status: 'draft',
  },
  {
    id: '4',
    title: 'Indie Night Market Live',
    description: 'Food stalls, live bands, and indie vibes all night.',
    date: '2026-03-22T18:30:00',
    location: 'Riverside Walk',
    image:
      'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&q=80&w=1000',
    organizerId: 'u3',
    seatMapId: 'sm4',
    minPrice: 15,
    maxPrice: 60,
    status: 'published',
  },
  {
    id: '5',
    title: 'Startup Pitch Day',
    description: 'Watch founders pitch and meet investors & builders.',
    date: '2026-03-28T13:00:00',
    location: 'Tech Convention Center',
    image:
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=1000',
    organizerId: 'u3',
    seatMapId: 'sm5',
    minPrice: 25,
    maxPrice: 120,
    status: 'published',
  },
  {
    id: '6',
    title: 'Jazz & Wine Evening',
    description: 'Smooth jazz trio with curated wine tasting.',
    date: '2026-04-05T20:00:00',
    location: 'Grand Hall',
    image:
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=1000',
    organizerId: 'u4',
    seatMapId: 'sm6',
    minPrice: 40,
    maxPrice: 180,
    status: 'published',
  },
  {
    id: '7',
    title: 'City Marathon Expo',
    description: 'Race bib pickup, gear booths, and training talks.',
    date: '2026-04-10T09:30:00',
    location: 'Exhibition Center',
    image:
      'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&q=80&w=1000',
    organizerId: 'u4',
    seatMapId: 'sm7',
    minPrice: 0,
    maxPrice: 0,
    status: 'published',
  },
  {
    id: '8',
    title: 'K-Pop Dance Workshop',
    description: 'Beginner-friendly choreography class with a pro coach.',
    date: '2026-04-12T15:00:00',
    location: 'Studio District',
    image:
      'https://images.unsplash.com/photo-1520975958225-b53cfe0329f4?auto=format&fit=crop&q=80&w=1000',
    organizerId: 'u5',
    seatMapId: 'sm8',
    minPrice: 12,
    maxPrice: 35,
    status: 'published',
  },
  {
    id: '9',
    title: 'Art & Craft Weekend Fair',
    description: 'Local artists, handmade goods, and live demos.',
    date: '2026-04-26T10:00:00',
    location: 'Old Town Square',
    image:
      'https://images.unsplash.com/photo-1526481280695-3c687fd5432c?auto=format&fit=crop&q=80&w=1000',
    organizerId: 'u5',
    seatMapId: 'sm9',
    minPrice: 5,
    maxPrice: 25,
    status: 'published',
  },
  {
    id: '10',
    title: 'Sunset Rooftop Cinema',
    description: 'Outdoor screening with headphones and skyline view.',
    date: '2026-05-02T18:45:00',
    location: 'Rooftop Deck',
    image:
      'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=1000',
    organizerId: 'u6',
    seatMapId: 'sm10',
    minPrice: 10,
    maxPrice: 30,
    status: 'published',
  },
  {
    id: '11',
    title: 'UX Research Roundtable',
    description: 'A practical session sharing real research stories and methods.',
    date: '2026-05-08T19:00:00',
    location: 'Downtown Hub',
    image:
      'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&q=80&w=1000',
    organizerId: 'u6',
    seatMapId: 'sm11',
    minPrice: 20,
    maxPrice: 70,
    status: 'published',
  },
  {
    id: '12',
    title: 'Electronic Music Warehouse',
    description: 'All-night DJ set with immersive lights and sound.',
    date: '2026-05-16T22:00:00',
    location: 'Warehouse 12',
    image:
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&q=80&w=1000',
    organizerId: 'u7',
    seatMapId: 'sm12',
    minPrice: 30,
    maxPrice: 140,
    status: 'published',
  },
];

export default eventsData;

