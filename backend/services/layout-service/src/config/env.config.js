import 'dotenv/config';

const config = {
    port: process.env.PORT || 8080,
    mongoUri: process.env.MONGODB_URI
};

export default config;