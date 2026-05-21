import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';
import cors from 'cors';
import { initDb } from './server/db';
import apiRoutes from './server/routes';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Set up uploads directory and multer
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }
  
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadsDir)
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + ext)
    }
  });
  const upload = multer({ storage: storage });

  app.use('/uploads', express.static(uploadsDir));

  // Initialize Database
  try {
    initDb();
    console.log("Database initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize database:", err);
  }

  // Use API Routes
  app.use('/api', apiRoutes);

  // Remaining specialized API Routes
  app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  });

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

  app.post('/api/ai/optimize-product', async (req, res) => {
    try {
      const { product } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: 'Gemini API Key missing' });
      
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Actúa como un experto en SEO para ecommerce automotriz. 
Recibirás los datos de un producto. Optimiza el título (name) para que sea atractivo, reescribe la descripción (description) amigable para el SEO en HTML, genera un meta_title de máximo 60 caracteres, un meta_description de máximo 160 caracteres, y un slug optimizado amigable sin caracteres especiales. Devuelve estrictamente un JSON válido con esta estructura:
{
  "name": "Nuevo título optimizado",
  "description": "Nueva descripción en HTML",
  "meta_title": "Título SEO",
  "meta_description": "Descripción SEO",
  "slug": "url-amigable-slug"
}
Datos del producto original:
Nombre: ${product.name}
Descripción: ${product.description || ''}
Vehículo compatible: ${product.vehicle || ''}`;

      const response = await ai.models.generateContent({
         model: 'gemini-2.5-flash',
         contents: prompt,
         config: {
           responseMimeType: "application/json",
           temperature: 0.7
         }
      });
      
      if (response.text) {
        const parsed = JSON.parse(response.text);
        res.json(parsed);
      } else {
        res.status(500).json({ error: 'Blank response' });
      }
    } catch(e) {
      console.error('Optimization failed:', e);
      res.status(500).json({ error: 'Failed to optimize product' });
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

  // Catch unhandled /api/* routes so they return JSON 404, not HTML
  app.use('/api', (req, res) => {
    res.status(404).json({ error: 'API route not found: ' + req.path });
  });

  // Global Error Handler for API routes
  app.use('/api', (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('API Error:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
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
