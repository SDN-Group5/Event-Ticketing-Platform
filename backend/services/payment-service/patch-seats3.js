const mongoose = require('mongoose');

const uri = "mongodb+srv://phuocthde180577_db_user:Phuoc12345@cluster0.ruhl6tb.mongodb.net/SDNTicket?appName=Cluster0";

// Helper from frontend
const getRowLetter = (rowNum) => {
    let temp = rowNum;
    let letter = '';
    while (temp > 0) {
        temp--;
        letter = String.fromCharCode(65 + (temp % 26)) + letter;
        temp = Math.floor(temp / 26);
    }
    return letter;
};

async function patch() {
    console.log("Connecting to database...");
    const db = await mongoose.createConnection(uri).asPromise();
    
    // Seat model exists in layout
    const SeatSchema = new mongoose.Schema({
        row: mongoose.Schema.Types.Mixed,
        seatNumber: mongoose.Schema.Types.Mixed,
        zoneId: String,
        seatLabel: String
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
                // If it's 24 chars, it's a mongo ID (a mapped seat)
                if (updatedItem.seatId && updatedItem.seatId.length === 24) {
                    const seat = await Seat.findById(updatedItem.seatId);
                    if (seat) {
                        const correctLabel = seat.seatLabel || `${getRowLetter(seat.row)}${seat.seatNumber}`;
                        // See if it differs
                        if (updatedItem.seatLabel !== correctLabel) {
                            updatedItem.seatLabel = correctLabel;
                            changed = true;
                            console.log(`Fixed seatLabel for order ${order._id} item ${updatedItem.seatId} to ${correctLabel}`);
                        }
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
        if (ticket.seatId && ticket.seatId.length === 24) {
             const seat = await Seat.findById(ticket.seatId);
             if (seat) {
                 const correctLabel = seat.seatLabel || `${getRowLetter(seat.row)}${seat.seatNumber}`;
                 if(ticket.seatLabel !== correctLabel) {
                     await Ticket.updateOne({ _id: ticket._id }, { $set: { seatLabel: correctLabel } });
                     updatedTickets++;
                     console.log(`Fixed seatLabel for ticket ${ticket._id} seat ${ticket.seatId} to ${correctLabel}`);
                 }
             }
        }
    }

    console.log(`Finished. Fixed ${updatedOrders} orders and ${updatedTickets} tickets`);
    process.exit(0);
}

patch().catch(console.error);
