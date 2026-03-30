import fetch from 'node-fetch';

async function test() {
  const res = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@ctvds.in', password: 'Admin@1234' })
  });
  const { token } = await res.json();
  
  const filesRes = await fetch('http://localhost:3000/api/uploads', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const files = await filesRes.json();
  console.log(files);
}
test();
