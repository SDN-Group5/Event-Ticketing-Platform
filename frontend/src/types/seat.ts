export interface Seat {
    id: string;
    row: string;
    number: number;
    zone: string;
    status: 'available' | 'selected' | 'occupied' | 'blocked';
    price: number;
    panoramaUrl?: string;
}

export interface SeatZone {
    id: string;
    name: string;
    type: string;
    price: number;
    color: string;
    rows: number;
    seatsPerRow: number;
}

export interface SelectedSeat {
    id: string;
    row: string;
    number: number;
    zone: string;
    price: number;
}
