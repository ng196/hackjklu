import initDatabase from './init.js';
import { DEFAULT_FI_TYPES, DEMO_USER_PROFILES, ensureSeededDemoUser } from './demoDataService.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

async function generateUsers() {
    console.log('Starting DB init before user generation...');
    await initDatabase();

    const summary = [];

    for (const userContext of DEMO_USER_PROFILES) {
        const result = await ensureSeededDemoUser({
            userContext,
            forceRegenerate: true,
            fiTypes: userContext.fiTypes || DEFAULT_FI_TYPES
        });

        summary.push({
            name: result.user.full_name,
            userId: result.user.id,
            mobile: result.user.mobile,
            email: result.user.email,
            seeded: result.seeded,
            recordCount: result.recordCount || 0,
            sessionId: result.session?.session_id || null
        });

        console.log(
            `Seeded user ${result.user.full_name} (${result.user.id}) with ${result.recordCount || 0} FI records`
        );
    }

    console.log('\nDemo users generation complete.');
    console.log(JSON.stringify({ count: summary.length, users: summary }, null, 2));
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
    generateUsers()
        .then(() => process.exit(0))
        .catch((err) => {
            console.error('Failed to generate demo users:', err.message);
            process.exit(1);
        });
}

export default generateUsers;
