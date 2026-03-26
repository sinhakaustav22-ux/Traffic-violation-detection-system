import axios from 'axios';

async function testLogin() {
  try {
    const res = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'admin@ctvds.in',
      password: 'Admin@1234'
    });
    console.log('Login success:', res.data);
  } catch (err) {
    console.error('Login failed:', err.response?.data || err.message);
  }
}

testLogin();
