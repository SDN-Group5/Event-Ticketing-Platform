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
];

export default eventsData;

