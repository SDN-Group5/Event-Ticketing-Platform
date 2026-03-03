import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGODB_ATLAS_URI;

  if (!uri) {
    throw new Error('MONGODB_URI hoặc MONGODB_ATLAS_URI chưa được set trong .env');
  }

  try {
    await mongoose.connect(uri);
    console.log('✅ Payment Service kết nối MongoDB thành công');
  } catch (err) {
    console.error('❌ Payment Service không thể kết nối MongoDB:', err);
    process.exit(1);
  }
};
