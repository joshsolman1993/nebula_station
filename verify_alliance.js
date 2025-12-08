const API_URL = 'http://localhost:5000/api';
let token = '';

const loginOrRegister = async (email, username) => {
    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: 'password123' })
        });
        const data = await res.json();
        if (data.success) {
            console.log(`✅ Login successful: ${username}`);
            return data.token;
        } else {
            const regRes = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password: 'password123' })
            });
            const regData = await regRes.json();
            if (regData.success) {
                console.log(`✅ Registration successful: ${username}`);
                return regData.token;
            } else {
                console.error(`❌ Login/Register failed: ${username}`, data.error || regData.error);
            }
        }
    } catch (error) {
        console.error(`❌ Network error: ${username}`, error.message);
    }
};

const giveCredits = async (userToken) => {
    // Admin cheat to ensure user has credits
    try {
        // Need admin token... skipping for now, assume seedAdmin worked or user has credits.
        // Or I can use my new admin system if I implemented it securely, but that might be complex.
        // Instead, I'll just rely on starting credits (0)? 
        // Wait, start credits is 0 in user model.
        // I need to give them credits.
        // Admin user "admin" should exist from previous phase.

        // Login as admin
        const adminToken = await loginOrRegister('admin@nebula.com', 'AdminCommander');
        if (!adminToken) return;

        // Use Admin API to give resources?
        // I haven't implemented a direct "give credits" user endpoint, only admin might have it.
        // Let's assume I need to manually update DB or use admin endpoint if exists.
        // Server "seedAdmin" creates an admin.

        // I'll try to use the admin endpoint if I recall correctly.
        // `adminController.giveResources` POST /api/admin/give-resources

        const res = await fetch(`${API_URL}/admin/give-resources`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({
                username: 'AllianceLeader',
                resources: { credits: 2000 }
            })
        });
        const data = await res.json();
        console.log('💰 Gave credits:', data.success ? 'Success' : data.error);

    } catch (error) {
        console.error('❌ Give credits error:', error.message);
    }
}

const run = async () => {
    console.log('--- Alliance Verification ---');

    // 1. Setup Leader
    const leaderToken = await loginOrRegister('leader2@test.com', 'AllianceLeader2');
    if (!leaderToken) return;

    // Give credits
    await giveCredits();

    // 2. Create Alliance
    const allianceName = `Test Alliance ${Date.now()}`;
    const allianceTag = `T${Math.floor(Math.random() * 900) + 100}`;

    console.log(`🔨 Creating Alliance: ${allianceName} [${allianceTag}]...`);
    const createRes = await fetch(`${API_URL}/alliance/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${leaderToken}`
        },
        body: JSON.stringify({ name: allianceName, tag: allianceTag })
    });
    const createData = await createRes.json();
    if (createData.success) {
        console.log('✅ Alliance Created!');
    } else {
        console.error('❌ Creation failed:', createData.error);
        if (createData.error.includes('already exists')) {
            // That's fine for re-runs
        }
    }

    // 3. Donate
    console.log('💸 Donating 100 Credits...');
    const donateRes = await fetch(`${API_URL}/alliance/donate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${leaderToken}`
        },
        body: JSON.stringify({ resource: 'credits', amount: 100 })
    });
    const donateData = await donateRes.json();
    if (donateData.success) {
        console.log(`✅ Donated! Bank Credits: ${donateData.allianceResources.credits}`);
    } else {
        console.error('❌ Donation failed:', donateData.error);
    }

    // 4. Get My Alliance
    const myAllianceRes = await fetch(`${API_URL}/alliance/my-alliance`, {
        headers: { 'Authorization': `Bearer ${leaderToken}` }
    });
    const myAllianceData = await myAllianceRes.json();
    if (myAllianceData.success) {
        console.log(`✅ My Alliance: ${myAllianceData.alliance.name}, Members: ${myAllianceData.alliance.members.length}`);
    }

    // 5. Leave (optional, skipping to keep user in alliance for manual check)
    // ...
};

run();
