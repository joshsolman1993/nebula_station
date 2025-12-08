const BASE_URL = 'http://localhost:5000/api';

async function run() {
    try {
        console.log('--- Debugging Map Fetch ---');

        // 1. Register Temp User
        const username = `dbg_${Date.now().toString().slice(-8)}`;
        console.log(`Creating user ${username}...`);

        const regRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,
                email: `${username}@test.com`,
                password: 'password123'
            })
        });
        const regData = await regRes.json();
        if (!regData.success) {
            console.error('Registration Failed:', regData.error);
            return;
        }
        const token = regData.token;
        console.log('User created. Token obtained.');

        // 2. Fetch Map
        console.log('Fetching Galaxy Map...');
        const mapRes = await fetch(`${BASE_URL}/galaxy/map`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const mapData = await mapRes.json();

        console.log('--- RAW RESPONSE ---');
        console.log(JSON.stringify(mapData, null, 2));

        if (mapData.success) {
            const map = mapData.map;
            const sectors = map.sectors ? Object.values(map.sectors) : Object.values(map);
            console.log(`\nParsed Sectors Count: ${sectors.length}`);
        }

    } catch (error) {
        console.error('Debug Failed:', error);
    }
}

run();
