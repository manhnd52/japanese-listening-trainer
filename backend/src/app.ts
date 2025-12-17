import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import { config } from './config/env.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import { requestLogger } from './middlewares/requestLogger.js';
import authRoute from './routes/auth.route.js';
import healthRoute from './routes/health.route.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Application = express();


app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));


const allowedOrigins = config.corsOrigin.split(',').map(o => o.trim());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(express.static(path.join(__dirname, '..', 'public')));


app.use(
  '/audio',
  express.static(path.join(__dirname, '..', 'public', 'audio'), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.mp3')) {
        res.setHeader('Content-Type', 'audio/mpeg');
      } else if (filePath.endsWith('.wav')) {
        res.setHeader('Content-Type', 'audio/wav');
      } else if (filePath.endsWith('.ogg')) {
        res.setHeader('Content-Type', 'audio/ogg');
      }

      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
  })
);


if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}
app.use(requestLogger);


app.use('/auth', authRoute);
app.use('/health', healthRoute);
app.use('/api', routes);


app.use(notFoundHandler);
app.use(errorHandler);

export default app;
