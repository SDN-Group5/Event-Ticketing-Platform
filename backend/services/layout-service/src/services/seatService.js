import Seat from '../models/Seat.js';
import EventLayout from '../models/EventLayout.js';
import mongoose from 'mongoose';
import { broadcastSeatUpdate } from '../socket.js';

class SeatService {
    /**
     * Generate seats cho một zone và khởi tạo cache
     */
    async generateSeatsForZone(eventId, layoutId, zone) {
        const seats = [];
        const totalSeats = zone.rows * zone.seatsPerRow;

        for (let row = 1; row <= zone.rows; row++) {
            for (let seatNum = 1; seatNum <= zone.seatsPerRow; seatNum++) {
                seats.push({
                    eventId,
                    layoutId,
                    zoneId: zone.id,
                    row,
                    seatNumber: seatNum,
                    seatLabel: `${zone.name}-R${row}S${seatNum}`,
                    price: zone.price || 0,
                    status: 'available'
                });
            }
        }

        // Bulk insert seats
        await Seat.insertMany(seats);

        // ✨ HYBRID: Initialize cache in zone
        await EventLayout.updateOne(
            { _id: layoutId, 'zones.id': zone.id },
            {
                $set: {
                    'zones.$.seatMetadata': {
                        totalSeats,
                        availableSeats: totalSeats,
                        reservedSeats: 0,
                        soldSeats: 0,
                        blockedSeats: 0,
                        lastUpdated: new Date()
                    }
                }
            }
        );

        return seats;
    }

    /**
     * ✨ HYBRID: Update cache khi seat status thay đổi
     */
    async updateZoneCache(layoutId, zoneId) {
        const counts = await Seat.aggregate([
            { $match: { layoutId: new mongoose.Types.ObjectId(layoutId), zoneId } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const metadata = {
            totalSeats: 0,
            availableSeats: 0,
            reservedSeats: 0,
            soldSeats: 0,
            blockedSeats: 0,
            lastUpdated: new Date()
        };

        counts.forEach(({ _id, count }) => {
            metadata.totalSeats += count;
            if (_id === 'available') metadata.availableSeats = count;
            if (_id === 'reserved') metadata.reservedSeats = count;
            if (_id === 'sold') metadata.soldSeats = count;
            if (_id === 'blocked') metadata.blockedSeats = count;
        });

        await EventLayout.updateOne(
            { _id: layoutId, 'zones.id': zoneId },
            { $set: { 'zones.$.seatMetadata': metadata } }
        );

        return metadata;
    }

    /**
     * Reserve seat với timeout (mặc định 15 phút - làm fallback cho order)
     * Không giới hạn số ghế mỗi user, chỉ cần seat còn available.
     */
    async reserveSeat(eventId, zoneId, row, seatNumber, userId, timeoutMinutes = 15) {
        const objectIdEventId = new mongoose.Types.ObjectId(eventId);

        const expiryTime = new Date(Date.now() + timeoutMinutes * 60 * 1000);

        const seat = await Seat.findOneAndUpdate(
            {
                eventId: objectIdEventId,
                zoneId,
                row,
                seatNumber,
                status: 'available'
            },
            {
                $set: {
                    status: 'reserved',
                    reservedBy: userId,
                    reservedAt: new Date(),
                    reservationExpiry: expiryTime
                },
                $inc: { version: 1 }
            },
            { new: true }
        );

        if (!seat) {
            throw new Error('Seat not available');
        }

        await this.updateZoneCache(seat.layoutId, zoneId);

        broadcastSeatUpdate(eventId, [{
            zoneId, row, seatNumber,
            status: 'reserved',
            reservedBy: userId,
        }]);

        return seat;
    }

    /**
     * Confirm purchase (reserved → sold)
     */
    async confirmPurchase(seatId, userId, bookingId) {
        const seat = await Seat.findOneAndUpdate(
            {
                _id: seatId,
                status: 'reserved',
                reservedBy: userId
            },
            {
                $set: {
                    status: 'sold',
                    soldBy: userId,
                    soldAt: new Date(),
                    bookingId,
                    reservationExpiry: null
                },
                $inc: { version: 1 }
            },
            { new: true }
        );

        if (!seat) {
            throw new Error('Seat not reserved by this user');
        }

        await this.updateZoneCache(seat.layoutId, seat.zoneId);

        broadcastSeatUpdate(String(seat.eventId), [{
            zoneId: seat.zoneId, row: seat.row, seatNumber: seat.seatNumber,
            status: 'sold',
        }]);

        return seat;
    }

    /**
     * Release reservation
     */
    async releaseReservation(seatId, userId) {
        const seat = await Seat.findOneAndUpdate(
            {
                _id: seatId,
                status: 'reserved',
                reservedBy: userId
            },
            {
                $set: {
                    status: 'available',
                    reservedBy: null,
                    reservedAt: null,
                    reservationExpiry: null
                },
                $inc: { version: 1 }
            },
            { new: true }
        );

        if (!seat) {
            throw new Error('Seat not found or not reserved by this user');
        }

        await this.updateZoneCache(seat.layoutId, seat.zoneId);

        broadcastSeatUpdate(String(seat.eventId), [{
            zoneId: seat.zoneId, row: seat.row, seatNumber: seat.seatNumber,
            status: 'available',
        }]);

        return seat;
    }

    /**
     * Auto-release expired reservations (Cron job)
     */
    async releaseExpiredReservations() {
        const expiredSeats = await Seat.find({
            status: 'reserved',
            reservationExpiry: { $lt: new Date() }
        });

        if (expiredSeats.length === 0) return [];

        await Seat.updateMany(
            {
                status: 'reserved',
                reservationExpiry: { $lt: new Date() }
            },
            {
                $set: {
                    status: 'available',
                    reservedBy: null,
                    reservedAt: null,
                    reservationExpiry: null
                },
                $inc: { version: 1 }
            }
        );

        const affectedZones = new Map();
        const eventBroadcasts = new Map();

        expiredSeats.forEach(seat => {
            const zKey = `${seat.layoutId}-${seat.zoneId}`;
            affectedZones.set(zKey, { layoutId: seat.layoutId, zoneId: seat.zoneId });

            const eId = String(seat.eventId);
            if (!eventBroadcasts.has(eId)) eventBroadcasts.set(eId, []);
            eventBroadcasts.get(eId).push({
                zoneId: seat.zoneId, row: seat.row, seatNumber: seat.seatNumber,
                status: 'available',
            });
        });

        for (const { layoutId, zoneId } of affectedZones.values()) {
            await this.updateZoneCache(layoutId, zoneId);
        }

        for (const [eventId, seats] of eventBroadcasts) {
            broadcastSeatUpdate(eventId, seats);
        }

        return expiredSeats;
    }

    /**
     * Get seats by zone (với pagination)
     */
    async getSeatsByZone(eventId, zoneId, options = {}) {
        const { status, page = 1, limit = 100 } = options;

        const query = { eventId: new mongoose.Types.ObjectId(eventId), zoneId };
        if (status) query.status = status;

        const seats = await Seat.find(query)
            .sort({ row: 1, seatNumber: 1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        const total = await Seat.countDocuments(query);

        return {
            seats,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }
}

export default new SeatService();
