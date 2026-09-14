const crypto = require('crypto');

async function run() {
  const rstr = crypto.randomBytes(4).toString('hex');
  const user1 = { name: 'u1', username: 'u1_'+rstr, password: 'Password1' };
  const user2 = { name: 'u2', username: 'u2_'+rstr, password: 'Password1' };

  try {
    // 1. Register User 1
    await fetch('http://127.0.0.1:5001/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(user1) });
    const login1Res = await fetch('http://127.0.0.1:5001/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: user1.username, password: user1.password }) });
    const login1 = await login1Res.json();
    const token1 = login1.token;
    
    // 2. Create Board as User 1
    const createBoardRes = await fetch('http://127.0.0.1:5001/api/boards', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token1}` }, body: JSON.stringify({ name: 'Board by U1' }) });
    const createBoard = await createBoardRes.json();
    
    // 3. Register User 2
    await fetch('http://127.0.0.1:5001/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(user2) });
    const login2Res = await fetch('http://127.0.0.1:5001/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: user2.username, password: user2.password }) });
    const login2 = await login2Res.json();
    const token2 = login2.token;
    
    // 4. Fetch Boards as User 2
    const boards2Res = await fetch('http://127.0.0.1:5001/api/boards', { headers: { Authorization: `Bearer ${token2}` } });
    const boards2 = await boards2Res.json();
    console.log('User 2 sees boards:', boards2.map ? boards2.map(b => b.name) : boards2);

    // 5. Fetch Boards as User 1 (Old Account)
    const boards1Res = await fetch('http://127.0.0.1:5001/api/boards', { headers: { Authorization: `Bearer ${token1}` } });
    const boards1 = await boards1Res.json();
    console.log('User 1 sees boards:', boards1.map ? boards1.map(b => b.name) : boards1);

  } catch (err) {
    console.error('Error:', err);
  }
}
run();
