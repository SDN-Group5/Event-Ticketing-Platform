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
    elevation?: number; // Height/elevation in 3D view (default: 0)
    hideScreen?: boolean; // Whether to hide the screen in 3D/2D views
}

export interface EventLayout {
    eventId: string;
    eventName?: string;
    zones: LayoutZone[];
    createdAt: string;
    updatedAt: string;
}
