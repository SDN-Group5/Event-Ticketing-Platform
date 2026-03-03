// Shared layout types used by layout editor, 2D/3D viewers and layout APIs

export interface LayoutPosition {
  x: number;
  y: number;
}

export interface LayoutSize {
  width: number;
  height: number;
}

export type LayoutZoneType =
  | 'seats'
  | 'standing'
  | 'stage'
  | 'exit'
  | 'barrier'
  | 'spotlight'
  | string;

export interface LayoutZone {
  id: string;
  name: string;
  type: LayoutZoneType;
  position: LayoutPosition;
  size: LayoutSize;
  color: string;
  rotation?: number;
  rows?: number;
  seatsPerRow?: number;
  price?: number;
  elevation?: number;
  hideScreen?: boolean;
  screenHeight?: number;
  screenWidthRatio?: number;
  videoUrl?: string;
}

export interface EventLayout {
  eventId: string;
  eventName?: string;

  // Optional event metadata used by the frontend
  eventDate?: string;
  eventImage?: string;
  eventLocation?: string;
  eventDescription?: string;
  minPrice?: number;

  zones: LayoutZone[];

  // Canvas configuration
  canvasWidth?: number;
  canvasHeight?: number;
  canvasColor?: string;

  createdAt?: string;
  updatedAt?: string;
}

