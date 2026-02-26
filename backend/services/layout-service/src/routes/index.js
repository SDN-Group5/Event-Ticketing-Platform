import layoutRoutes from './layoutRoutes.js';
import seatRoutes from './seatRoutes.js';

function indexRoute(app) {
    app.use('/api/v1/layouts', layoutRoutes);
    app.use('/api/v1', seatRoutes);
}
export default indexRoute;