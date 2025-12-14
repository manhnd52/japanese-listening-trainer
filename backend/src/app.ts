import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { config } from './config/env';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import { requestLogger } from './middlewares/requestLogger';
import authRoute from '@routes/auth.route';
import healthRoute from '@routes/health.route';
import { authenticateToken } from '@middlewares/auth.middleware';

const app: Application = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" } //  Allow cross-origin resources
}));

// ✅ CORS - Cho phép frontend truy cập
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//  Static files - Serve audio với headers đúng
app.use(express.static(path.join(__dirname, '..', 'public')));

//  Riêng route /audio với MIME type và range support
app.use('/audio', express.static(path.join(__dirname, '..', 'public', 'audio'), {
  setHeaders: (res, filePath) => {
    // Set correct MIME type
    if (filePath.endsWith('.mp3')) {
      res.setHeader('Content-Type', 'audio/mpeg');
    } else if (filePath.endsWith('.wav')) {
      res.setHeader('Content-Type', 'audio/wav');
    } else if (filePath.endsWith('.ogg')) {
      res.setHeader('Content-Type', 'audio/ogg');
    }
    
    // Enable range requests (for seeking/streaming)
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
  }
}));

// Logging middleware
if (config.nodeEnv === 'development') {
    app.use(morgan('dev'));
}
app.use(requestLogger);

app.use('/auth', authRoute);
app.use('/health', healthRoute);

// API routes
app.use('/api', authenticateToken, routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;