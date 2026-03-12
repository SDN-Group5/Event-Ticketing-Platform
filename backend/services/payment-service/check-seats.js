const mongoose = require('mongoose');
const fs = require('fs');
const uri = "mongodb+srv://phuocthde180577_db_user:Phuoc12345@cluster0.ruhl6tb.mongodb.net/SDNTicket?appName=Cluster0";

async function run() {
    const db = await mongoose.createConnection(uri).asPromise();
    const SeatSchema = new mongoose.Schema({}, { strict: false });
    const Seat = db.model('Seat', SeatSchema, 'seats');
    
    const seats = await Seat.find({}).limit(5);
    fs.writeFileSync('seats.json', JSON.stringify(seats, null, 2), 'utf8');
    process.exit(0);
}

run().catch(console.error);
