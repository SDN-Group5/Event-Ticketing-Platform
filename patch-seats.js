const mongoose = require('mongoose');

async function patch() {
    console.log("Connecting to layout database...");
    const layoutDb = await mongoose.createConnection('mongodb://localhost:27017/ticket-platform-layout').asPromise();
    // Assuming Seat model exists in layout
    const SeatLayoutSchema = new mongoose.Schema({
        row: mongoose.Schema.Types.Mixed,
        seatNumber: mongoose.Schema.Types.Mixed,
        zoneId: String,
    }, { strict: false });
    const Seat = layoutDb.model('Seat', SeatLayoutSchema, 'seats');

    console.log("Connecting to order database...");
    const orderDb = await mongoose.createConnection('mongodb://localhost:27017/ticket-platform-order').asPromise();
    const OrderSchema = new mongoose.Schema({
        items: [{
            zoneName: String,
            seatId: String,
            seatLabel: String,
            price: Number,
            quantity: Number
        }]
    }, { strict: false });
    const Order = orderDb.model('Order', OrderSchema, 'orders');

    const TicketSchema = new mongoose.Schema({
        seatId: String,
        seatLabel: String,
    }, { strict: false });
    const Ticket = orderDb.model('Ticket', TicketSchema, 'tickets');

    const orders = await Order.find({});
    let updatedOrders = 0;
    for (let order of orders) {
        let changed = false;
        if (order.items && order.items.length > 0) {
            let newItems = [];
            for (let item of order.items) {
                // clone item because mongoose might be strict
                let updatedItem = { ...item._doc };
                if (updatedItem.seatId && updatedItem.seatId.length === 24 && !updatedItem.seatLabel) {
                    const seat = await Seat.findById(updatedItem.seatId);
                    if (seat) {
                        updatedItem.seatLabel = `${seat.row}${seat.seatNumber}`;
                        changed = true;
                        console.log(`Updated seatLabel for order ${order._id} item ${updatedItem.seatId} to ${updatedItem.seatLabel}`);
                    }
                }
                newItems.push(updatedItem);
            }
            if (changed) {
                await Order.updateOne({ _id: order._id }, { $set: { items: newItems } });
                updatedOrders++;
            }
        }
    }

    const tickets = await Ticket.find({});
    let updatedTickets = 0;
    for (let ticket of tickets) {
        if (ticket.seatId && ticket.seatId.length === 24 && (!ticket.seatLabel || ticket.seatLabel.includes('-'))) {
             const seat = await Seat.findById(ticket.seatId);
             if (seat) {
                 await Ticket.updateOne({ _id: ticket._id }, { $set: { seatLabel: `${seat.row}${seat.seatNumber}` } });
                 updatedTickets++;
                 console.log(`Updated seatLabel for ticket ${ticket._id} seat ${ticket.seatId} to ${seat.row}${seat.seatNumber}`);
             }
        }
    }

    console.log(`Updated ${updatedOrders} orders and ${updatedTickets} tickets`);
    process.exit(0);
}

patch().catch(console.error);
