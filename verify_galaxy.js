const API_URL = 'http://localhost:5000/api';
let token = '';

const login = async () => {
    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123'
            })
        });
        const data = await res.json();
        if (data.success) {
            token = data.token;
            console.log('✅ Login successful');
            console.log('Current Sector:', data.user.currentSector);
            return data.user;
        } else {
            console.log('ℹ️  Login failed, trying register...');
            const regRes = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: 'GalaxyExplorer',
                    email: 'test@example.com',
                    password: 'password123'
                })
            });
            const regData = await regRes.json();
            if (regData.success) {
                token = regData.token;
                console.log('✅ Registration successful');
                return regData.user;
            } else {
                console.error('❌ Login/Register failed:', data.error || regData.error);
            }
        }
    } catch (error) {
        console.error('❌ Network error:', error.message);
    }
};

const getMap = async () => {
    try {
        const res = await fetch(`${API_URL}/galaxy/map`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            console.log(`✅ Map fetched: ${data.map.length} sectors`);
            return data.map;
        } else {
            console.error('❌ Fetch map failed:', data.error);
        }
    } catch (error) {
        console.error('❌ Map error:', error.message);
    }
};

const travel = async (targetId) => {
    try {
        console.log(`🚀 Attempting travel to ${targetId}...`);
        const res = await fetch(`${API_URL}/galaxy/travel`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ targetSectorId: targetId })
        });
        const data = await res.json();
        if (data.success) {
            console.log('✅ Travel started:', data.message);
            return true;
        } else {
            console.log('ℹ️  Travel failed:', data.error);
            return false;
        }
    } catch (error) {
        console.error('❌ Travel error:', error.message);
    }
};

const arrive = async () => {
    try {
        console.log('⏳ Waiting for arrival...');
        // Wait 32 seconds
        await new Promise(resolve => setTimeout(resolve, 32000));

        const res = await fetch(`${API_URL}/galaxy/arrive`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            console.log('✅ Arrived:', data.message);
        } else {
            console.error('❌ Arrival failed:', data.error);
        }
    } catch (error) {
        console.error('❌ Arrival error:', error.message);
    }
};

const run = async () => {
    const user = await login();
    if (!token) return;

    const map = await getMap();
    if (!map) return;

    // Find a neighbor
    const currentSectorId = user.currentSector || 'sec_alpha';
    const currentSector = map.find(s => s.id === currentSectorId);

    if (currentSector && currentSector.connections.length > 0) {
        const targetId = currentSector.connections[0];
        const started = await travel(targetId);
        if (started) {
            await arrive();
        }
    } else {
        console.log('❌ No connections found or invalid sector');
    }
};

run();
