// ============================================
// SCRIPT: Tạo Database & Collections cho Smart Hotel
// CÁCH CHẠY: 
//   1. Mở Terminal (KHÔNG PHẢI MongoDB Compass Shell)
//   2. Chạy: mongosh < scripts/create-database.js
//   3. Hoặc copy-paste vào MongoDB Compass Shell
// ============================================

// Chuyển sang database SmartHotel (tự động tạo nếu chưa có)
use("SmartHotel");

print("✅ Đã chuyển sang database: SmartHotel");

// ============================================
// COLLECTION: users
// ============================================
print("\n📝 Đang tạo collection: users...");
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "password", "firstName", "lastName"],
      properties: {
        email: { bsonType: "string" },
        password: { bsonType: "string" },
        firstName: { bsonType: "string" },
        lastName: { bsonType: "string" },
        role: {
          enum: ["user", "admin", "hotel_owner", "receptionist", "manager"],
        },
      },
    },
  },
});

db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ companyId: 1 });
db.users.createIndex({ role: 1 });
print("✅ Collection 'users' đã được tạo với indexes");

// ============================================
// COLLECTION: companies
// ============================================
print("\n📝 Đang tạo collection: companies...");
db.createCollection("companies");
db.companies.createIndex({ taxId: 1 }, { unique: true });
db.companies.createIndex({ isActive: 1 });
print("✅ Collection 'companies' đã được tạo với indexes");

// ============================================
// COLLECTION: hotels
// ============================================
print("\n📝 Đang tạo collection: hotels...");
db.createCollection("hotels");
db.hotels.createIndex({ userId: 1 });
db.hotels.createIndex({ companyId: 1 });
db.hotels.createIndex({ city: 1 });
db.hotels.createIndex({ city: 1, starRating: 1 });
db.hotels.createIndex({ pricePerNight: 1, starRating: 1 });
print("✅ Collection 'hotels' đã được tạo với indexes");

// ============================================
// COLLECTION: rooms
// ============================================
print("\n📝 Đang tạo collection: rooms...");
db.createCollection("rooms");
db.rooms.createIndex({ hotelId: 1, roomNumber: 1 }, { unique: true });
db.rooms.createIndex({ hotelId: 1, status: 1 });
db.rooms.createIndex({ roomType: 1 });
print("✅ Collection 'rooms' đã được tạo với indexes");

// ============================================
// COLLECTION: bookings
// ============================================
print("\n📝 Đang tạo collection: bookings...");
db.createCollection("bookings");
db.bookings.createIndex({ userId: 1, createdAt: -1 });
db.bookings.createIndex({ hotelId: 1, checkIn: 1 });
db.bookings.createIndex({ roomId: 1 });
db.bookings.createIndex({ status: 1 });
db.bookings.createIndex({ paymentStatus: 1 });
db.bookings.createIndex({ checkIn: 1, status: 1 });
print("✅ Collection 'bookings' đã được tạo với indexes");

// ============================================
// COLLECTION: servicerequests
// ============================================
print("\n📝 Đang tạo collection: servicerequests...");
db.createCollection("servicerequests");
db.servicerequests.createIndex({ bookingId: 1, status: 1 });
db.servicerequests.createIndex({ userId: 1, createdAt: -1 });
db.servicerequests.createIndex({ hotelId: 1 });
print("✅ Collection 'servicerequests' đã được tạo với indexes");

// ============================================
// COLLECTION: promotions
// ============================================
print("\n📝 Đang tạo collection: promotions...");
db.createCollection("promotions");
db.promotions.createIndex({ hotelId: 1, isActive: 1 });
db.promotions.createIndex({ startDate: 1, endDate: 1 });
db.promotions.createIndex({ isActive: 1, startDate: 1, endDate: 1 });
print("✅ Collection 'promotions' đã được tạo với indexes");

// ============================================
// COLLECTION: seasonalpricings
// ============================================
print("\n📝 Đang tạo collection: seasonalpricings...");
db.createCollection("seasonalpricings");
db.seasonalpricings.createIndex({ hotelId: 1, roomType: 1, isActive: 1 });
db.seasonalpricings.createIndex({ startDate: 1, endDate: 1 });
db.seasonalpricings.createIndex({ hotelId: 1, startDate: 1, endDate: 1 });
print("✅ Collection 'seasonalpricings' đã được tạo với indexes");

// ============================================
// COLLECTION: contracts
// ============================================
print("\n📝 Đang tạo collection: contracts...");
db.createCollection("contracts");
db.contracts.createIndex({ companyId: 1, status: 1 });
db.contracts.createIndex({ customerId: 1 });
db.contracts.createIndex({ contractCode: 1 }, { unique: true });
db.contracts.createIndex({ expiryDate: 1 });
print("✅ Collection 'contracts' đã được tạo với indexes");

// ============================================
// COLLECTION: contractfinancials
// ============================================
print("\n📝 Đang tạo collection: contractfinancials...");
db.createCollection("contractfinancials");
db.contractfinancials.createIndex({ contractId: 1 }, { unique: true });
print("✅ Collection 'contractfinancials' đã được tạo với indexes");

// ============================================
// COLLECTION: aicontractanalyses
// ============================================
print("\n📝 Đang tạo collection: aicontractanalyses...");
db.createCollection("aicontractanalyses");
db.aicontractanalyses.createIndex({ contractId: 1 }, { unique: true });
db.aicontractanalyses.createIndex({ riskLevel: 1 });
print("✅ Collection 'aicontractanalyses' đã được tạo với indexes");

// ============================================
// COLLECTION: auditlogs
// ============================================
print("\n📝 Đang tạo collection: auditlogs...");
db.createCollection("auditlogs");
db.auditlogs.createIndex({ userId: 1, timestamp: -1 });
db.auditlogs.createIndex({ targetType: 1, targetId: 1 });
db.auditlogs.createIndex({ action: 1, timestamp: -1 });
print("✅ Collection 'auditlogs' đã được tạo với indexes");

// ============================================
// COLLECTION: reviews
// ============================================
print("\n📝 Đang tạo collection: reviews...");
db.createCollection("reviews");
db.reviews.createIndex({ hotelId: 1, rating: 1 });
db.reviews.createIndex({ userId: 1 });
db.reviews.createIndex({ bookingId: 1 });
print("✅ Collection 'reviews' đã được tạo với indexes");

// ============================================
// COLLECTION: analytics
// ============================================
print("\n📝 Đang tạo collection: analytics...");
db.createCollection("analytics");
db.analytics.createIndex({ date: 1 }, { unique: true });
print("✅ Collection 'analytics' đã được tạo với indexes");

// ============================================
// HOÀN THÀNH
// ============================================
print("\n🎉 ============================================");
print("✅ Đã tạo xong tất cả collections và indexes!");
print("📊 Danh sách collections:");
print("============================================\n");

const collections = db.getCollectionNames();
collections.forEach((collection) => {
  const count = db[collection].countDocuments();
  print(`   - ${collection}: ${count} documents`);
});

print("\n✅ Database SmartHotel đã sẵn sàng!");
print("🚀 Bạn có thể bắt đầu chạy backend và test APIs!\n");

