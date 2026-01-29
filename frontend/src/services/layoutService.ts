// Layout storage service - manages event layouts in localStorage

import { EventLayout, LayoutZone } from '../types/layout';

const STORAGE_KEY = 'eventLayouts';

/**
 * Get all saved event layouts from localStorage
 */
export const getAllEventLayouts = (): EventLayout[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error reading layouts from localStorage:', error);
        return [];
    }
};

/**
 * Get layout for a specific event
 */
export const getEventLayout = (eventId: string): EventLayout | null => {
    const layouts = getAllEventLayouts();
    return layouts.find(layout => layout.eventId === eventId) || null;
};

/**
 * Save layout for an event (creates or updates)
 */
export const saveEventLayout = (
    eventId: string,
    zones: LayoutZone[],
    eventName?: string
): EventLayout => {
    const layouts = getAllEventLayouts();
    const existingIndex = layouts.findIndex(l => l.eventId === eventId);
    const now = new Date().toISOString();

    const layout: EventLayout = {
        eventId,
        eventName,
        zones,
        createdAt: existingIndex >= 0 ? layouts[existingIndex].createdAt : now,
        updatedAt: now,
    };

    if (existingIndex >= 0) {
        layouts[existingIndex] = layout;
    } else {
        layouts.push(layout);
    }

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts));
    } catch (error) {
        console.error('Error saving layout to localStorage:', error);
        throw new Error('Failed to save layout');
    }

    return layout;
};

/**
 * Delete layout for an event
 */
export const deleteEventLayout = (eventId: string): boolean => {
    const layouts = getAllEventLayouts();
    const filtered = layouts.filter(l => l.eventId !== eventId);

    if (filtered.length === layouts.length) {
        return false; // Nothing was deleted
    }

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        return true;
    } catch (error) {
        console.error('Error deleting layout from localStorage:', error);
        return false;
    }
};

/**
 * Check if an event has a saved layout
 */
export const hasEventLayout = (eventId: string): boolean => {
    return getEventLayout(eventId) !== null;
};
