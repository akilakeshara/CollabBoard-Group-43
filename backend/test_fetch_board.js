const crypto = require('crypto');

async function run() {
  const rstr = crypto.randomBytes(4).toString('hex');
  const user = { name: 'u1', username: 'u1_'+rstr, password: 'Password1' };

  try {
    // 1. Register User 
    await fetch('http://localhost:5001/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(user) });
    const loginRes = await fetch('http://localhost:5001/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: user.username, password: user.password }) });
    const login = await loginRes.json();
    const token = login.token;
    
    // 2. Create Board
    const createBoardRes = await fetch('http://localhost:5001/api/boards', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ name: 'Test Board' }) });
    const board = await createBoardRes.json();
    console.log("Created Board ID:", board._id);

    // 3. Fetch Board by ID
    const fetchBoardRes = await fetch(`http://localhost:5001/api/boards/${board._id}`, { headers: { Authorization: `Bearer ${token}` } });
    console.log("Status:", fetchBoardRes.status);
    const data = await fetchBoardRes.json();
    console.log("Data:", data);

  } catch (err) {
    console.error('Error:', err);
  }
}
run();
