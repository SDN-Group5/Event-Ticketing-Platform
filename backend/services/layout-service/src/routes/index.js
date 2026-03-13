import layoutRoutes from './layoutRoutes.js';
import seatRoutes from './seatRoutes.js';
import eventApprovalRoutes from './eventApprovalRoutes.js';

function indexRoute(app) {
    app.use('/api/v1/layouts', layoutRoutes);
    app.use('/api/v1', seatRoutes);
    app.use('/api/events', eventApprovalRoutes);
    // When Railway path-based routing strips /api/v1/layouts, requests arrive at /
    app.use('/', layoutRoutes);
}
export default indexRoute;