const BASE_URL = 'http://localhost:5000/api';
let token;
let user;

async function run() {
    try {
        console.log('--- starting dominion verification ---');

        // 1. Register User
        const username = `dominion_tester_${Date.now()}`;
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

        if (!regData.success && !regData.token) {
            throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
        }

        token = regData.token;
        user = regData.user;
        console.log('User created:', user.username);

        // 2. Fetch Galaxy Map
        console.log('Fetching Galaxy Map...');
        const mapRes = await fetch(`${BASE_URL}/galaxy/map`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const mapData = await mapRes.json();

        if (!mapData.success) throw new Error(`Fetch Map failed: ${JSON.stringify(mapData)}`);

        // Handle dictionary vs array format
        const map = mapData.map;
        const sectors = map.sectors ? Object.values(map.sectors) : Object.values(map);
        console.log(`Map fetched. ${sectors.length} sectors found.`);

        if (sectors.length === 0) {
            throw new Error('Galaxy Map is empty! Seeding failed.');
        }

        // Find current sector
        const currentSectorId = user.currentSector;
        console.log('Current Sector ID from reg:', currentSectorId);

        // 3. Create Alliance
        console.log('Creating Alliance...');
        let allianceId;
        const allianceRes = await fetch(`${BASE_URL}/alliance/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                name: `Domination Force ${Date.now()}`,
                tag: 'DOM',
                color: '#ff0000'
            })
        });
        const allianceData = await allianceRes.json();

        if (allianceData.success) {
            console.log('Alliance created:', allianceData.alliance.name);
            allianceId = allianceData.alliance._id;
        } else {
            console.error('Alliance creation failed (Check cost?):', allianceData.error);
        }

        // 4. Try to claim sector (Expected Failure: Insufficient funds)
        const target = sectors.find(s => s.id === currentSectorId);
        console.log(`Attempting to claim current sector: ${target.name} (${target.id})`);

        const claimRes = await fetch(`${BASE_URL}/alliance/claim-sector`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ sectorId: target.id })
        });
        const claimData = await claimRes.json();

        if (claimData.success) {
            console.log('Claim Success! (Unexpected if resources low)');
        } else {
            console.log('Claim Failed as expected (likely resources):', claimData.error);
        }

        console.log('--- verify dominion complete ---');

    } catch (error) {
        console.error('Verification Failed:', error.message);
    }
}

run();
