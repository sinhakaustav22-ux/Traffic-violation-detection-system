import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';

async function test() {
  const res = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@ctvds.in', password: 'Admin@1234' })
  });
  const { token } = await res.json();
  
  fs.writeFileSync('test.jpg', 'fake image data');
  
  const form = new FormData();
  form.append('image', fs.createReadStream('test.jpg'));
  
  const uploadRes = await fetch('http://localhost:3000/api/uploads/image', {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      ...form.getHeaders()
    },
    body: form
  });
  const uploadData = await uploadRes.json();
  console.log('Upload:', uploadData);
  
  const filesRes = await fetch('http://localhost:3000/api/uploads', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const files = await filesRes.json();
  console.log('Files:', files);
}
test();
