const http = require('http');

const data = JSON.stringify({
  customer_name: "John Doe",
  customer_email: "john@doe.com",
  shipping_address: "123 Main St",
  items: [
    { id: "5-v1", name: "Casco", price: 85000, quantity: 1 }
  ],
  total: 85000
});

const req = http.request('http://localhost:3000/api/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log('Status:', res.statusCode, 'Body:', body));
});

req.on('error', console.error);
req.write(data);
req.end();
