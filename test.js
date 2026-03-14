const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:5000';

async function request(path, options = {}) {
	const response = await fetch(`${API_BASE_URL}${path}`, {
		...options,
		headers: {
			'Content-Type': 'application/json',
			...(options.headers || {})
		}
	});

	const bodyText = await response.text();
	const body = bodyText ? JSON.parse(bodyText) : null;

	if (!response.ok) {
		throw new Error(`Request failed (${response.status}): ${bodyText}`);
	}

	return body;
}

async function listUsers() {
	return request('/users');
}

async function seedDemoUsers(forceRegenerate = false) {
	return request('/users/demo/seed-many', {
		method: 'POST',
		body: JSON.stringify({ forceRegenerate })
	});
}

async function getDashboardContext(userId) {
	return request(`/users/${userId}/dashboard-context`);
}

async function getApiData({ uid, mobile, email, includeTransactions = false }) {
	return request('/api/data', {
		method: 'POST',
		headers: {
			TXN: includeTransactions ? 'true' : 'false'
		},
		body: JSON.stringify({ uid, mobile, email })
	});
}

async function main() {
	console.log(`Using backend: ${API_BASE_URL}`);

	const seeded = await seedDemoUsers(true);
	console.log('Seeded users:', seeded.count);

	const usersPayload = await listUsers();
	const users = usersPayload.users || [];
	console.log('Available users:', users.length);

	if (users.length === 0) {
		console.log('No users found.');
		return;
	}

	const firstUser = users[0];
	console.log('Selected user:', {
		id: firstUser.id,
		full_name: firstUser.full_name,
		mobile: firstUser.mobile,
		email: firstUser.email
	});

	const dashboard = await getDashboardContext(firstUser.id);
	console.log('Dashboard snapshot:', {
		accounts: dashboard.accounts?.length || 0,
		transactions: dashboard.recentTransactions?.length || 0,
		hasInsights: Boolean(dashboard.inferred?.insights)
	});

	const apiDerived = await getApiData({ uid: firstUser.id, includeTransactions: false });
	console.log('API /api/data (derived):', {
		accounts: apiDerived.accounts?.length || 0,
		hasInsights: Boolean(apiDerived.inferred)
	});

	const apiTransactions = await getApiData({ uid: firstUser.id, includeTransactions: true });
	console.log('API /api/data (with TXN=true):', {
		transactions: apiTransactions.transactions?.length || 0,
		firstTransaction: apiTransactions.transactions?.[0] || null
	});
}

main().catch((err) => {
	console.error('Backend query failed:', err.message);
	process.exit(1);
});
