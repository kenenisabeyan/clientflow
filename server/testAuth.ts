const http = require('http');

function post(path, data) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5001,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let out = '';
        res.on('data', (chunk) => (out += chunk));
        res.on('end', () => resolve({ status: res.statusCode, body: out }));
      }
    );

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

(async () => {
  try {
    const register = await post('/api/auth/register', { name: 'testuser', email: 'testuser@example.com', password: 'password123' });
    console.log('register status', register.status, register.body);
    const login = await post('/api/auth/login', { email: 'testuser@example.com', password: 'password123' });
    console.log('login status', login.status, login.body);
  } catch (err) {
    console.error('error', err);
  }
})();