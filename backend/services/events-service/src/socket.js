let io = null;

export function setIO(ioInstance) {
    io = ioInstance;
}

export function getIO() {
    return io;
}

/**
 * Broadcast seat status changes to all clients watching the same event.
 * @param {string} eventId
 * @param {Array} seats - Array of { zoneId, row, seatNumber, status, reservedBy? }
 */
export function broadcastSeatUpdate(eventId, seats) {
    if (!io) return;
    io.to(`event:${eventId}`).emit('seats-updated', { eventId, seats });
}
