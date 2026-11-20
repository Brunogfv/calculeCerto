import { createCaptureHandler } from './_lib/capture-handler.mjs';
import { getSharedPool } from './_lib/db.mjs';

export const config = {
    path: '/api/capture-html',
    rateLimit: {
        windowLimit: 60,
        windowSize: 60,
        aggregateBy: ['ip', 'domain']
    }
};

export default createCaptureHandler({
    getPool: () => getSharedPool(process.env)
});
