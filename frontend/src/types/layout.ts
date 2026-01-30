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
    rotation?: number; // Rotation in degrees
    rows?: number;
    seatsPerRow?: number;
    price?: number;
    elevation?: number; // Height/elevation in 3D view (default: 0)
    hideScreen?: boolean; // Whether to hide the screen in 3D/2D views
    videoUrl?: string; // URL for the stage screen video
    screenHeight?: number; // Height of the stage screen
    screenWidthRatio?: number; // Ratio of screen width to stage width (0-1)
}

export interface EventLayout {
    eventId: string;
    eventName?: string;
    zones: LayoutZone[];
    canvasWidth?: number;
    canvasHeight?: number;
    canvasColor?: string;
    createdAt: string;
    updatedAt: string;
}
