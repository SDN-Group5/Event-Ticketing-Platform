const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Helper to generate ObjectId-like string if not provided, but we'll try to use provided ones or generate 24-char hex
const generateObjectId = () => {
    return crypto.randomBytes(12).toString('hex');
};

const layouts = [
    {
        "_id": { "$oid": "6988d5bb0fd486b5e33f6e5b" },
        "eventId": { "$oid": "65c4d6f8e7b1a2b3c4d5e6f7" },
        "eventName": "Test Event",
        "eventDate": { "$date": "2026-03-15T19:00:00.000Z" },
        "eventImage": "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14",
        "eventLocation": "Madison Square Garden, NY",
        "eventDescription": "An amazing test event featuring the latest hits and a spectacular light show.",
        "minPrice": 50,
        "zones": [
            {
                "position": { "x": 290, "y": 280 },
                "size": { "width": 160, "height": 80 },
                "id": "zone-1770744600524-ga8qkap2g",
                "name": "New Seats",
                "type": "seats",
                "color": "#22c55e",
                "rotation": 0,
                "rows": 4,
                "seatsPerRow": 8,
                "price": 50,
                "elevation": 0,
                "hideScreen": false,
                "displayOrder": 0
            },
            {
                "position": { "x": 404.0439453125, "y": 111.15972137451172 },
                "size": { "width": 150, "height": 80 },
                "id": "zone-1770744604614-tkeby8m5b",
                "name": "New Stage",
                "type": "stage",
                "color": "#f59e0b",
                "rotation": 0,
                "elevation": 0,
                "hideScreen": false,
                "displayOrder": 0
            },
            {
                "position": { "x": 80.0439453125, "y": 80.0115737915039 },
                "size": { "width": 150, "height": 80 },
                "id": "zone-1770745587149-stew9nila",
                "name": "New Stage",
                "type": "stage",
                "color": "#f59e0b",
                "rotation": 0,
                "elevation": 0,
                "hideScreen": false,
                "displayOrder": 0
            }
        ],
        "canvasWidth": 800,
        "canvasHeight": 600,
        "canvasColor": "#1a1a2e",
        "createdBy": { "$oid": "65c4d6f8e7b1a2b3c4d5e6f8" },
        "version": 4,
        "createdAt": { "$date": "2026-02-08T18:28:11.017Z" },
        "updatedAt": { "$date": "2026-02-10T17:46:29.417Z" },
        "__v": 3
    },
    {
        "_id": { "$oid": "698a3069aa6b464d9eada92f" },
        "eventId": { "$oid": "507f1f77bcf86cd799439011" },
        "eventName": "The Grand Symphony",
        "eventDate": { "$date": "2026-04-20T20:00:00.000Z" },
        "eventImage": "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae",
        "eventLocation": "Sydney Opera House, Australia",
        "eventDescription": "Experience the grandeur of a full symphony orchestra performing classical masterpieces.",
        "minPrice": 15,
        "zones": [
            {
                "position": { "x": 290, "y": 20 },
                "size": { "width": 300, "height": 50 },
                "id": "stage-1",
                "name": "Main Stage",
                "type": "stage",
                "color": "#64748b",
                "rotation": 0,
                "elevation": 2,
                "hideScreen": false,
                "displayOrder": 0
            },
            {
                "position": { "x": 330, "y": 130 },
                "size": { "width": 210, "height": 100 },
                "id": "standing-1",
                "name": "General Standing",
                "type": "standing",
                "color": "#22c55e",
                "rotation": 0,
                "price": 15,
                "elevation": 0,
                "hideScreen": false,
                "displayOrder": 0
            },
            {
                "position": { "x": 130, "y": 50 },
                "size": { "width": 150, "height": 50 },
                "id": "zone-1769682172705-c9v1llch0",
                "name": "stage",
                "type": "stage",
                "color": "#22c55e",
                "rotation": 340,
                "elevation": 2,
                "hideScreen": false,
                "displayOrder": 0
            },
            {
                "position": { "x": 600, "y": 50 },
                "size": { "width": 150, "height": 50 },
                "id": "zone-1769713057241-c79bm530o",
                "name": "New Stage",
                "type": "stage",
                "color": "#8655f6",
                "rotation": 20,
                "elevation": 2,
                "hideScreen": false,
                "displayOrder": 0
            },
            {
                "position": { "x": 230, "y": 300 },
                "size": { "width": 160, "height": 80 },
                "id": "zone-1770744550709-ammg7ydb7",
                "name": "New Seats",
                "type": "seats",
                "color": "#8655f6",
                "rotation": 0,
                "rows": 4,
                "seatsPerRow": 8,
                "price": 50,
                "elevation": 0,
                "hideScreen": false,
                "displayOrder": 0
            },
            {
                "position": { "x": 390, "y": 300 },
                "size": { "width": 160, "height": 80 },
                "id": "zone-1770744552427-91evvb6y1",
                "name": "New Seats",
                "type": "seats",
                "color": "#f59e0b",
                "rotation": 0,
                "rows": 4,
                "seatsPerRow": 8,
                "price": 50,
                "elevation": 0,
                "hideScreen": false,
                "displayOrder": 0
            },
            {
                "position": { "x": 370, "y": 380 },
                "size": { "width": 160, "height": 80 },
                "id": "zone-1770744554063-lbglqzjbe",
                "name": "New Seats",
                "type": "seats",
                "color": "#22c55e",
                "rotation": 0,
                "rows": 4,
                "seatsPerRow": 8,
                "price": 50,
                "elevation": 0,
                "hideScreen": false,
                "displayOrder": 0
            }
        ],
        "canvasWidth": 850,
        "canvasHeight": 750,
        "canvasColor": "#1a1a2e",
        "createdBy": { "$oid": "507f1f77bcf86cd799439022" },
        "version": 5,
        "createdAt": { "$date": "2026-01-29T10:21:43.747Z" },
        "updatedAt": { "$date": "2026-02-10T17:30:59.617Z" },
        "__v": 4
    }
];

const users = [];
const seats = [];

// Generate 7 Users
for (let i = 0; i < 7; i++) {
    users.push({
        "_id": { "$oid": generateObjectId() },
        "username": `user${i + 1}`,
        "email": `user${i + 1}@example.com`,
        "password": "$2b$10$YourHashedPasswordHere", // Placeholder hash
        "role": "client",
        "createdAt": { "$date": new Date().toISOString() },
        "updatedAt": { "$date": new Date().toISOString() }
    });
}

// Generate Seats
layouts.forEach(layout => {
    const layoutId = layout._id.$oid;
    const eventId = layout.eventId.$oid;

    layout.zones.forEach(zone => {
        if (zone.type === 'seats') {
            const rows = zone.rows || 0;
            const seatsPerRow = zone.seatsPerRow || 0;

            for (let r = 1; r <= rows; r++) {
                for (let s = 1; s <= seatsPerRow; s++) {
                    const seatId = generateObjectId();
                    const status = Math.random() < 0.3 ? (Math.random() < 0.5 ? 'reserved' : 'sold') : 'available'; // 30% chance occupied

                    let seatData = {
                        "_id": { "$oid": seatId },
                        "eventId": { "$oid": eventId },
                        "layoutId": { "$oid": layoutId },
                        "zoneId": zone.id,
                        "row": r,
                        "seatNumber": s,
                        "seatLabel": `${String.fromCharCode(64 + r)}${s}`,
                        "status": status,
                        "price": zone.price || 0,
                        "version": 0,
                        "createdAt": { "$date": new Date().toISOString() },
                        "updatedAt": { "$date": new Date().toISOString() }
                    };

                    if (status !== 'available') {
                        const randomUser = users[Math.floor(Math.random() * users.length)];
                        const userId = randomUser._id.$oid;

                        if (status === 'reserved') {
                            seatData.reservedBy = { "$oid": userId };
                            seatData.reservedAt = { "$date": new Date().toISOString() };
                            // Expire in 15 mins
                            const expiry = new Date();
                            expiry.setMinutes(expiry.getMinutes() + 15);
                            seatData.reservationExpiry = { "$date": expiry.toISOString() };
                        } else if (status === 'sold') {
                            seatData.soldBy = { "$oid": userId };
                            seatData.soldAt = { "$date": new Date().toISOString() };
                        }
                    }

                    seats.push(seatData);
                }
            }
        }
    });
});

// Write files
const outputDir = path.join(__dirname, 'mock_data');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

fs.writeFileSync(path.join(outputDir, 'layouts.json'), JSON.stringify(layouts, null, 2));
fs.writeFileSync(path.join(outputDir, 'users.json'), JSON.stringify(users, null, 2));
fs.writeFileSync(path.join(outputDir, 'seats.json'), JSON.stringify(seats, null, 2));

console.log('Mock data generated in:', outputDir);
