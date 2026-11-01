/**
 * MAZAQ Server Entry Point
 * Express + Vite Full-Stack Server
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import apiRouter from './server/routes';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Body parsers with generous limits for image uploads
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // Serve static uploads
  const uploadsDir = path.resolve(process.env.MAZAQ_UPLOADS_DIR || path.join(process.cwd(), 'public', 'uploads'));
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsDir));

  // Mount API router FIRST before any static or SPA fallback
  app.use('/api', apiRouter);

  // Vite development middleware or static production serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✨ MAZAQ Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal Server Error:', err);
  process.exit(1);
});
