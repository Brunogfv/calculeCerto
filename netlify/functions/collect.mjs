import { createCollectHandler } from './_lib/collect-handler.mjs';
import { getSharedPool } from './_lib/db.mjs';

export const config = {
    path: '/api/collect'
};

export default createCollectHandler({
    getPool: () => getSharedPool(process.env)
});
