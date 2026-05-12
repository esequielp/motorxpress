import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Wait for requests to simulate external APIs if real keys are absent
  
  // API Routes
  app.post('/api/chat', async (req, res) => {
    try {
      const { messages } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
         return res.status(500).json({ error: 'Gemini API Key missing' });
      }
      
      const ai = new GoogleGenAI({ apiKey });
      
      const systemInstruction = "Eres un asistente experto en repuestos y mecánica automotriz de la tienda MotorXpress en Chile. Ayudas a los clientes a encontrar repuestos, verificar compatibilidad y resolver dudas mecánicas. Responde de forma concisa, amable y siempre recomendando buscar en nuestro catálogo en caso de dudas sobre disponibilidad. Usa un tono profesional pero cercano (chileno neutro).";
      
      const formattedMessages = messages.map((m: any) => ({
         role: m.role === 'assistant' ? 'model' : 'user',
         parts: [{ text: m.content }]
      }));

      const response = await ai.models.generateContent({
         model: 'gemini-2.5-flash',
         contents: formattedMessages,
         config: {
           systemInstruction: systemInstruction,
           temperature: 0.3
         }
      });

      res.json({ reply: response.text });
    } catch(e) {
      console.error(e);
      res.status(500).json({ error: 'Chat failed' });
    }
  });

  app.post('/api/flow/create', async (req, res) => {
    try {
      const { orderId } = req.body;
      const baseUrl = process.env.APP_URL || `http://localhost:${PORT}`;
      
      // If no flow key, just simulate redirecting directly to confirmation
      if (!process.env.FLOW_API_KEY) {
        console.log("No Flow API Key detected, simulating payment...");
        return res.json({ redirectUrl: `${baseUrl}/checkout/confirmacion?token=simulated_token_${Date.now()}` });
      }

      // Real Flow Logic would go here using the client
      // For now, if we have keys, we still simulate for the sandbox demo
      res.json({ redirectUrl: `${baseUrl}/checkout/confirmacion?token=demo_token_${orderId}` });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Flow payment initialization failed' });
    }
  });

  app.get('/api/chilexpress/quote', async (req, res) => {
    try {
      const { commune, weight } = req.query;
      
      // If no API key, simulate response
      if (!process.env.CHILEXPRESS_API_KEY) {
        return res.json([
          {
            serviceType: 'EXPRESS',
            serviceDescription: 'Chilexpress Express',
            deliveryTime: '1-2 días hábiles',
            netPrice: 4193,
            taxPrice: 797,
            totalPrice: 4990
          },
          {
            serviceType: 'PRIORITY',
            serviceDescription: 'Chilexpress Prioritario',
            deliveryTime: '3-5 días hábiles',
            netPrice: 2512,
            taxPrice: 478,
            totalPrice: 2990
          }
        ]);
      }

      // Real integration logic...
      return res.json([]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Chilexpress quote failed' });
    }
  });

  app.get('/api/products', (req, res) => {
    // Mock catalog for the preview
    res.json([
      {
        id: '1',
        sku: 'MX-FLT-001',
        name: 'KIT FILTROS TOYOTA COROLLA 1.6',
        vehicle: 'Toyota Corolla 2005-2012 Sedán',
        price: 18990,
        stock: 5,
        image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=400&q=80',
        maxStock: 5
      },
      {
        id: '2',
        sku: 'MX-BUJ-002',
        name: 'BUJIAS IRIDIUM TOYOTA COROLLA',
        vehicle: 'Toyota Corolla 2005-2012 Sedán',
        price: 8500,
        stock: 12,
        image: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=400&q=80',
        maxStock: 12
      },
      {
        id: '3',
        sku: 'MX-PST-003',
        name: 'PASTILLAS DE FRENO CERÁMICAS',
        vehicle: 'Universal',
        price: 32900,
        stock: 2,
        image: 'https://images.unsplash.com/photo-1536700503339-1e4b06520771?auto=format&fit=crop&w=400&q=80',
        maxStock: 2
      },
      {
        id: '4',
        sku: 'MX-ACE-004',
        name: 'ACEITE SINTÉTICO 5W30 4L',
        vehicle: 'Universal',
        price: 26500,
        stock: 20,
        image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=400&q=80',
        maxStock: 20
      }
    ]);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
