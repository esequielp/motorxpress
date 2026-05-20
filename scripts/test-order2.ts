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
      { id: "6", name: "Combo", price: 24990, quantity: 1 }
    ],
    total: 24990
  })
}).then(r => r.json()).then(console.log).catch(console.error);
