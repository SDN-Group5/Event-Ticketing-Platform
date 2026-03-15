import EventLayout from '../models/EventLayout.js';
import BankAccount from '../models/BankAccount.js';
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

        // Hide sensitive info from public view
        const publicData = layout.toObject();
        delete publicData.payoutInfo;
        delete publicData.invoiceInfo;

        res.status(200).json({
            success: true,
            data: publicData
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
        // Chỉ lấy những sự kiện có status là 'published' (đã được Admin duyệt)
        const layouts = await EventLayout.find({ status: 'published' });

        // Hide sensitive info from public view
        const publicLayouts = layouts.map(l => {
            const obj = l.toObject();
            delete obj.payoutInfo;
            delete obj.invoiceInfo;
            return obj;
        });

        res.status(200).json({
            success: true,
            count: layouts.length,
            data: publicLayouts
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

// Get all completed layouts (Status is 'completed' or event date passed)
export const getCompletedLayouts = async (req, res) => {
    try {
        const now = new Date();
        const layouts = await EventLayout.find({
            $or: [
                { status: 'completed' },
                { eventDate: { $lt: now } }, // Also consider events whose date passed as completed
                { payoutStatus: 'paid' } // Events already paid should also be accessible (though analytics will filter them out if payoutStatus: pending)
            ]
        });

        res.status(200).json({
            success: true,
            count: layouts.length,
            data: layouts
        });
    } catch (error) {
        console.error('Error getting completed layouts:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Server error retrieving completed layouts'
            }
        });
    }
};

// Get layouts created by current user (Organizer/Admin)
export const getMyLayouts = async (req, res) => {
    try {
        const userId = req.user ? req.user.id : null;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Thiếu token xác thực'
                }
            });
        }

        const layouts = await EventLayout
            .find({ createdBy: userId })
            .sort({ createdAt: -1 })
            .lean(); // Use lean to get plain JS objects

        // Attach BankAccount info to layouts if requested
        try {
            const layoutEventIds = layouts.map(l => l.eventId);
            const bankAccounts = await BankAccount.find({ eventId: { $in: layoutEventIds } });
            const bankAccountMap = {};
            bankAccounts.forEach(ba => {
                bankAccountMap[ba.eventId] = {
                    accountName: ba.accountName,
                    accountNumber: ba.accountNumber,
                    bankName: ba.bankName,
                    branchName: ba.branchName
                };
            });

            layouts.forEach(l => {
                if (bankAccountMap[l.eventId]) {
                    l.payoutInfo = bankAccountMap[l.eventId];
                }
            });
        } catch (err) {
            console.error('Error attaching bank accounts to my layouts:', err);
        }

        res.status(200).json({
            success: true,
            count: layouts.length,
            data: layouts
        });
    } catch (error) {
        console.error('Error getting my layouts:', error);
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
            eventName, eventDate, eventEndDate, eventImage, eventLocation, eventDescription, minPrice,
            payoutInfo, invoiceInfo
        } = req.body;
        const userId = req.user ? req.user.id : null;

        // Basic permission check: Only organizer or admin can create
        if (req.user?.role !== 'organizer' && req.user?.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Chỉ Organizer hoặc Admin mới có quyền tạo layout'
                }
            });
        }

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
            eventEndDate,
            eventImage,
            eventLocation,
            eventDescription,
            minPrice,
            zones,
            canvasWidth,
            canvasHeight,
            canvasColor,
            payoutInfo,
            invoiceInfo,
            createdBy: userId,
            version: 1
        });

        await newLayout.save();

        // ✨ SEPARATE BANK ACCOUNT
        if (payoutInfo && Object.keys(payoutInfo).length > 0) {
            try {
                const newBankAccount = new BankAccount({
                    eventId: newLayout.eventId,
                    layoutId: newLayout._id,
                    organizerId: userId,
                    ...payoutInfo
                });
                await newBankAccount.save();
                console.log(`[Layout] Saved bank account for event: ${eventId}`);
            } catch (bankErr) {
                console.error(`[Layout] Error saving bank account for event ${eventId}:`, bankErr);
            }
        }

        // ✨ AUTO-GENERATE SEATS: Generate seats for all seat-based zones (seats and standing)
        const seatZones = newLayout.zones.filter(zone => zone.type === 'seats' || zone.type === 'standing');
        for (const zone of seatZones) {
            try {
                await seatService.generateSeatsForZone(eventId, newLayout._id, zone);
                const seatCount = zone.type === 'standing' ? zone.capacity : (zone.rows * zone.seatsPerRow);
                console.log(`[Layout] Generated ${seatCount} seats for zone: ${zone.name} (${zone.type})`);
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
            eventName, eventDate, eventEndDate, eventImage, eventLocation, eventDescription, minPrice
        } = req.body;

        const layout = await EventLayout.findOne({ eventId });
        const userId = req.user ? req.user.id : null;

        if (!layout) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'LAYOUT_NOT_FOUND',
                    message: 'No layout found for this event'
                }
            });
        }

        // Ownership check: Only creator or admin can update
        const isOwner = layout.createdBy && layout.createdBy.toString() === userId;
        const isAdmin = req.user?.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Bạn không có quyền chỉnh sửa layout của người khác'
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
                .filter(z => z.type === 'seats' || z.type === 'standing')
                .map(z => z.id)
        );
        const oldSeatZoneMap = new Map(
            layout.zones
                .filter(z => z.type === 'seats' || z.type === 'standing')
                .map(z => [z.id, typeof z.toObject === 'function' ? z.toObject() : z])
        );

        layout.zones = zones;
        layout.canvasWidth = canvasWidth;
        layout.canvasHeight = canvasHeight;
        layout.canvasColor = canvasColor;

        // Update event metadata if provided
        if (eventName) layout.eventName = eventName;
        if (eventDate) layout.eventDate = eventDate;
        if (eventEndDate) layout.eventEndDate = eventEndDate;
        if (eventImage) layout.eventImage = eventImage;
        if (eventLocation) layout.eventLocation = eventLocation;
        if (eventDescription) layout.eventDescription = eventDescription;
        if (minPrice !== undefined) layout.minPrice = minPrice;

        layout.version = (layout.version || 0) + 1;

        await layout.save();

        // ✨ UPDATE BANK ACCOUNT
        const payoutInfo = req.body.payoutInfo;
        if (payoutInfo && Object.keys(payoutInfo).length > 0) {
            try {
                const userId = req.user ? req.user.id : layout.createdBy;
                await BankAccount.findOneAndUpdate(
                    { eventId },
                    {
                        layoutId: layout._id,
                        organizerId: userId,
                        ...payoutInfo
                    },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                );
                console.log(`[Layout] Updated bank account for event: ${eventId}`);
            } catch (bankErr) {
                console.error(`[Layout] Error updating bank account for event ${eventId}:`, bankErr);
            }
        }

        // ✨ AUTO-GENERATE SEATS: Handle seat-based zones for updates
        const newSeatZones = zones.filter(z => z.type === 'seats' || z.type === 'standing');
        console.log(`[Layout] Processing ${newSeatZones.length} seat zones. Old zone map has ${oldSeatZoneMap.size} entries.`);

        // Find and delete seats for zones that were removed
        const newSeatZoneIds = new Set(newSeatZones.map(z => z.id));
        const deletedZoneIds = [...oldSeatZoneIds].filter(id => !newSeatZoneIds.has(id));

        if (deletedZoneIds.length > 0) {
            try {
                const Seat = (await import('../models/Seat.js')).default;
                const deleteResult = await Seat.deleteMany({
                    layoutId: layout._id,
                    zoneId: { $in: deletedZoneIds }
                });
                console.log(`[Layout] Deleted ${deleteResult.deletedCount} seats for removed zones:`, deletedZoneIds);
            } catch (err) {
                console.error('[Layout] Error deleting seats for removed zones:', err);
            }
        }

        for (const newZone of newSeatZones) {
            const oldZone = oldSeatZoneMap.get(newZone.id);
            console.log(`[Layout] Zone "${newZone.name}" (${newZone.id}): oldZone=${oldZone ? `type=${oldZone.type},rows=${oldZone.rows},cols=${oldZone.seatsPerRow},cap=${oldZone.capacity}` : 'NOT FOUND (NEW)'}, newZone: type=${newZone.type},rows=${newZone.rows},cols=${newZone.seatsPerRow},cap=${newZone.capacity}`);

            // Generate seats if it's a new zone or seat configuration changed
            const isSeatsChanged = oldZone?.type === 'seats' && newZone.type === 'seats' && (oldZone.rows !== newZone.rows || oldZone.seatsPerRow !== newZone.seatsPerRow);
            const isStandingChanged = oldZone?.type === 'standing' && newZone.type === 'standing' && oldZone.capacity !== newZone.capacity;
            const isTypeChanged = oldZone && oldZone.type !== newZone.type;

            if (!oldZone || isSeatsChanged || isStandingChanged || isTypeChanged) {
                console.log(`[Layout] Triggering seat (re)generation for zone "${newZone.name}" (${newZone.type})`);
                try {
                    // Delete old seats for this zone if reconfigured
                    if (oldZone) {
                        const Seat = (await import('../models/Seat.js')).default;
                        await Seat.deleteMany({ layoutId: layout._id, zoneId: newZone.id });
                        console.log(`[Layout] Deleted old seats for reconfigured zone: ${newZone.name}`);
                    }

                    // Generate new seats
                    await seatService.generateSeatsForZone(eventId, layout._id, newZone);
                    const seatCount = newZone.type === 'standing' ? newZone.capacity : (newZone.rows * newZone.seatsPerRow);
                    console.log(`[Layout] Generated ${seatCount} seats for zone: ${newZone.name}`);
                } catch (seatError) {
                    console.error(`[Layout] Error generating seats for zone ${newZone.name}:`, seatError);
                }
            } else if (oldZone && Number(oldZone.price) !== Number(newZone.price)) {
                // Zone size is the same, but price changed. Update prices of existing seats.
                console.log(`[Layout] Zone "${newZone.name}" price changed from ${oldZone.price} to ${newZone.price} - updating existing seats`);
                try {
                    const Seat = (await import('../models/Seat.js')).default;
                    const updateResult = await Seat.updateMany(
                        { layoutId: layout._id, zoneId: newZone.id },
                        { $set: { price: Number(newZone.price) || 0 } }
                    );
                    console.log(`[Layout] Updated price for ${updateResult.modifiedCount} seats in zone: ${newZone.name}`);
                } catch (priceUpdateError) {
                    console.error(`[Layout] Error updating seat prices for zone ${newZone.name}:`, priceUpdateError);
                }
            } else {
                console.log(`[Layout] Zone "${newZone.name}" unchanged (including price: ${oldZone?.price} vs ${newZone.price}) - skipping seat generation/update`);
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

        // Find layout first
        const layout = await EventLayout.findOne({ eventId });
        const userId = req.user ? req.user.id : null;

        if (!layout) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'LAYOUT_NOT_FOUND',
                    message: 'No layout found for this event'
                }
            });
        }

        // Ownership check: Only creator or admin can delete
        const isOwner = layout.createdBy && layout.createdBy.toString() === userId;
        const isAdmin = req.user?.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Bạn không có quyền xóa layout của người khác'
                }
            });
        }

        // ✨ CLEANUP: Delete all seats associated with this layout
        try {
            const Seat = (await import('../models/Seat.js')).default;
            const deletedSeats = await Seat.deleteMany({ layoutId: layout._id });
            console.log(`[Layout] Deleted ${deletedSeats.deletedCount} seats for layout: ${layout._id}`);
        } catch (seatError) {
            console.error('[Layout] Error deleting seats:', seatError);
        }

        // Delete the layout document
        await layout.deleteOne();

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
