import mongoose from 'mongoose';

export const connectDB = async () => {
  // Ưu tiên dùng MONGODB_URI / MONGODB_ATLAS_URI nếu có,
  // nếu không sẽ fallback sang MONGODB_CONNECTION_STRING (dùng chung với backend chính)
  const uri =
    process.env.MONGODB_URI ||
    process.env.MONGODB_ATLAS_URI ||
    process.env.MONGODB_CONNECTION_STRING;

  if (!uri) {
    throw new Error(
      'Chưa cấu hình connection string cho MongoDB. Hãy set một trong các biến: MONGODB_URI, MONGODB_ATLAS_URI hoặc MONGODB_CONNECTION_STRING trong file .env của backend.'
    );
  }

  try {
    await mongoose.connect(uri);
    console.log('✅ Payment Service kết nối MongoDB thành công');
  } catch (err) {
    console.error('❌ Payment Service không thể kết nối MongoDB:', err);
    process.exit(1);
  }
};
