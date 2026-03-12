const mongoose = require('mongoose');

const uri = "mongodb+srv://phuocthde180577_db_user:Phuoc12345@cluster0.ruhl6tb.mongodb.net/SDNTicket?appName=Cluster0";

async function patch() {
    console.log("Connecting to database...");
    const db = await mongoose.createConnection(uri).asPromise();
    
    // Seat model exists in layout
    const SeatSchema = new mongoose.Schema({
        row: mongoose.Schema.Types.Mixed,
        seatNumber: mongoose.Schema.Types.Mixed,
        zoneId: String,
    }, { strict: false });
    const Seat = db.model('Seat', SeatSchema, 'seats');

    const OrderSchema = new mongoose.Schema({
        items: [{
            zoneName: String,
            seatId: String,
            seatLabel: String,
            price: Number,
            quantity: Number
        }]
    }, { strict: false });
    const Order = db.model('Order', OrderSchema, 'orders');

    const TicketSchema = new mongoose.Schema({
        seatId: String,
        seatLabel: String,
    }, { strict: false });
    const Ticket = db.model('Ticket', TicketSchema, 'tickets');

    const orders = await Order.find({});
    let updatedOrders = 0;
    for (let order of orders) {
        let changed = false;
        if (order.items && order.items.length > 0) {
            let newItems = [];
            for (let item of order.items) {
                // clone item
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

    console.log(`Finished. Updated ${updatedOrders} orders and ${updatedTickets} tickets`);
    process.exit(0);
}

patch().catch(console.error);
