// Layout types for event-specific venue layouts

export interface Position {
    x: number;
    y: number;
}

export interface Size {
    width: number;
    height: number;
}

export type ZoneType = 'seats' | 'standing' | 'stage' | 'exit' | 'barrier';

export interface LayoutZone {
    id: string;
    name: string;
    type: ZoneType;
    position: Position;
    size: Size;
    color: string;
    rows?: number;
    seatsPerRow?: number;
    price?: number;
}

export interface EventLayout {
    eventId: string;
    eventName?: string;
    zones: LayoutZone[];
    createdAt: string;
    updatedAt: string;
}
