fetch('http://localhost:3000/api/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    customer_name: "John Doe",
    customer_email: "john@doe.com",
    shipping_address: "123 Main St",
    items: [
      { id: "5-v1", name: "Casco", price: 85000, quantity: 1 }
    ],
    total: 85000
  })
}).then(r => r.json()).then(console.log).catch(console.error);
