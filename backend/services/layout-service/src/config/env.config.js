import 'dotenv/config';

const config = {
    port: process.env.PORT || 8080,
    mongoUri: process.env.MONGODB_URI || process.env.MONGODB_CONNECTION_STRING || process.env.MONGODB_ATLAS_URI,
  };

export default config;