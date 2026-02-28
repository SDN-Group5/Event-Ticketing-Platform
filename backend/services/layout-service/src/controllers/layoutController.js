import EventLayout from '../models/EventLayout.js';
import seatService from '../services/seatService.js';


// Get layout by Event ID
export const getLayoutByEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const layout = await EventLayout.findOne({ eventId });

        if (!layout) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'LAYOUT_NOT_FOUND',
                    message: 'No layout found for this event'
                }
            });
        }

        res.status(200).json({
            success: true,
            data: layout
        });

    } catch (error) {
        console.error('Error getting layout:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Server error retrieving layout'
            }
        });
    }
};

// Get all layouts
export const getAllLayouts = async (req, res) => {
    try {
        const layouts = await EventLayout.find({});

        res.status(200).json({
            success: true,
            count: layouts.length,
            data: layouts
        });
    } catch (error) {
        console.error('Error getting all layouts:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Server error retrieving layouts'
            }
        });
    }
};

// Create or Update Layout
// Note: The spec distinguishes between Create and Update, but for simplicity we often handle upsert or strict separation.
// The spec says POST for create and PUT for update.

export const createLayout = async (req, res) => {
    try {
        const {
            eventId, zones, canvasWidth, canvasHeight, canvasColor,
            eventName, eventDate, eventImage, eventLocation, eventDescription, minPrice
        } = req.body;
        const userId = req.user ? req.user.id : null; // Assuming auth middleware sets req.user

        // Check if layout exists
        const existingLayout = await EventLayout.findOne({ eventId });
        if (existingLayout) {
            return res.status(409).json({
                success: false,
                error: {
                    code: 'LAYOUT_EXISTS',
                    message: 'A layout already exists for this event. Use PUT to update.'
                }
            });
        }

        const newLayout = new EventLayout({
            eventId,
            eventName,
            eventDate,
            eventImage,
            eventLocation,
            eventDescription,
            minPrice,
            zones,
            canvasWidth,
            canvasHeight,
            canvasColor,
            createdBy: userId,
            version: 1
        });

        await newLayout.save();

        // ✨ AUTO-GENERATE SEATS: Generate seats for all seat zones
        const seatZones = newLayout.zones.filter(zone => zone.type === 'seats');
        for (const zone of seatZones) {
            try {
                await seatService.generateSeatsForZone(eventId, newLayout._id, zone);
                console.log(`[Layout] Generated ${zone.rows * zone.seatsPerRow} seats for zone: ${zone.name}`);
            } catch (seatError) {
                console.error(`[Layout] Error generating seats for zone ${zone.name}:`, seatError);
                // Continue with other zones even if one fails
            }
        }

        res.status(201).json({
            success: true,
            data: newLayout
        });

    } catch (error) {
        console.error('Error creating layout:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: error.message
                }
            });
        }
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Server error creating layout'
            }
        });
    }
};

export const updateLayout = async (req, res) => {
    try {
        const { eventId } = req.params;
        const {
            zones, canvasWidth, canvasHeight, canvasColor, version,
            eventName, eventDate, eventImage, eventLocation, eventDescription, minPrice
        } = req.body;

        const layout = await EventLayout.findOne({ eventId });

        if (!layout) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'LAYOUT_NOT_FOUND',
                    message: 'No layout found for this event'
                }
            });
        }

        // Optimistic locking check
        if (version && layout.version !== version) {
            return res.status(409).json({
                success: false,
                error: {
                    code: 'VERSION_CONFLICT',
                    message: 'Layout has been modified by another user. Please refresh and try again.',
                    currentVersion: layout.version
                }
            });
        }

        // ✨ Capture old seat zone IDs BEFORE overwriting layout.zones
        const oldSeatZoneIds = new Set(
            layout.zones
                .filter(z => z.type === 'seats')
                .map(z => z.id)
        );
        const oldSeatZoneMap = new Map(
            layout.zones
                .filter(z => z.type === 'seats')
                .map(z => [z.id, z])
        );

        layout.zones = zones;
        layout.canvasWidth = canvasWidth;
        layout.canvasHeight = canvasHeight;
        layout.canvasColor = canvasColor;

        // Update event metadata if provided
        if (eventName) layout.eventName = eventName;
        if (eventDate) layout.eventDate = eventDate;
        if (eventImage) layout.eventImage = eventImage;
        if (eventLocation) layout.eventLocation = eventLocation;
        if (eventDescription) layout.eventDescription = eventDescription;
        if (minPrice !== undefined) layout.minPrice = minPrice;

        layout.version = (layout.version || 0) + 1;

        await layout.save();

        // ✨ AUTO-GENERATE SEATS: Handle seat zones for updates
        const newSeatZones = zones.filter(z => z.type === 'seats');
        console.log(`[Layout] Processing ${newSeatZones.length} seat zones. Old zone map has ${oldSeatZoneMap.size} entries.`);

        for (const newZone of newSeatZones) {
            const oldZone = oldSeatZoneMap.get(newZone.id);
            console.log(`[Layout] Zone "${newZone.name}" (${newZone.id}): oldZone=${oldZone ? `rows=${oldZone.rows},cols=${oldZone.seatsPerRow}` : 'NOT FOUND (NEW)'}, newZone: rows=${newZone.rows},cols=${newZone.seatsPerRow}`);

            // Generate seats if it's a new zone or seat configuration changed
            if (!oldZone || oldZone.rows !== newZone.rows || oldZone.seatsPerRow !== newZone.seatsPerRow) {
                console.log(`[Layout] Triggering seat (re)generation for zone "${newZone.name}"`);
                try {
                    // Delete old seats for this zone if reconfigured
                    if (oldZone) {
                        const Seat = (await import('../models/Seat.js')).default;
                        await Seat.deleteMany({ layoutId: layout._id, zoneId: newZone.id });
                        console.log(`[Layout] Deleted old seats for reconfigured zone: ${newZone.name}`);
                    }

                    // Generate new seats
                    await seatService.generateSeatsForZone(eventId, layout._id, newZone);
                    console.log(`[Layout] Generated ${newZone.rows * newZone.seatsPerRow} seats for zone: ${newZone.name}`);
                } catch (seatError) {
                    console.error(`[Layout] Error generating seats for zone ${newZone.name}:`, seatError);
                }
            } else {
                console.log(`[Layout] Zone "${newZone.name}" unchanged - skipping seat generation`);
            }
        }

        res.status(200).json({
            success: true,
            data: layout
        });

    } catch (error) {
        console.error('Error updating layout:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: error.message
                }
            });
        }
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Server error updating layout'
            }
        });
    }
};

export const deleteLayout = async (req, res) => {
    try {
        const { eventId } = req.params;
        const result = await EventLayout.deleteOne({ eventId });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'LAYOUT_NOT_FOUND',
                    message: 'No layout found for this event'
                }
            });
        }

        // ✨ CLEANUP: Delete all seats associated with this layout
        try {
            const Seat = (await import('../models/Seat.js')).default;
            const deletedSeats = await Seat.deleteMany({ eventId });
            console.log(`[Layout] Deleted ${deletedSeats.deletedCount} seats for event: ${eventId}`);
        } catch (seatError) {
            console.error('[Layout] Error deleting seats:', seatError);
        }

        res.status(200).json({
            success: true,
            message: 'Layout deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting layout:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Server error deleting layout'
            }
        });
    }
};

export const validateLayout = async (req, res) => {
    const { zones, canvasWidth, canvasHeight } = req.body;
    const warnings = [];
    const errors = [];

    // Basic validation logic
    if (zones) {
        zones.forEach(zone => {
            if (zone.type === 'seats' && (!zone.rows || !zone.seatsPerRow)) {
                errors.push({
                    zone: zone.id || zone.name,
                    field: 'rows/seatsPerRow',
                    message: 'rows and seatsPerRow are required for seat zones'
                });
            }

            // Check boundaries
            if (zone.position.x + zone.size.width > canvasWidth ||
                zone.position.y + zone.size.height > canvasHeight) {
                warnings.push({
                    zone: zone.id || zone.name,
                    message: 'Zone extends beyond canvas boundaries'
                });
            }
        });
    }

    if (errors.length > 0) {
        return res.status(200).json({
            success: true,
            valid: false,
            errors
        });
    }

    res.status(200).json({
        success: true,
        valid: true,
        warnings
    });
};
