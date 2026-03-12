import layoutRoutes from './layoutRoutes.js';
import seatRoutes from './seatRoutes.js';

function indexRoute(app) {
    app.use('/api/v1/layouts', layoutRoutes);
    app.use('/api/v1', seatRoutes);
    // When Railway path-based routing strips /api/v1/layouts, requests arrive at /
    app.use('/', layoutRoutes);
}
export default indexRoute;