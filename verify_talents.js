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
            console.log('Current Talent Points:', data.user.talentPoints);
            return data.user;
        } else {
            // Try register
            const regRes = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: 'TestCommander',
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

const learnTalent = async () => {
    try {
        const res = await fetch(`${API_URL}/game/talents/learn`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ talentId: 'efficient_mining' })
        });
        const data = await res.json();
        if (data.success) {
            console.log('✅ Learn Talent successful:', data.message);
        } else {
            console.log('ℹ️  Learn Talent result:', data.error);
        }
    } catch (error) {
        console.log('❌ Learn Talent error:', error.message);
    }
};

const run = async () => {
    await login();
    if (token) await learnTalent();
};

run();
