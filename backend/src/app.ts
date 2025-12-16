import express, { Application } from 'express';
import path from 'path';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';

import routes from './routes/index.js';
import { requestLogger } from './middlewares/requestLogger.js';
import { notFoundHandler, errorHandler } from './middlewares/errorHandler.js';

const app: Application = express();

// ================= SECURITY / CORS =================
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

const allowedOrigins = (process.env.CORS_ORIGIN || '*')
  .split(',')
  .map(s => s.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin))
        return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  })
);

// ================= BODY PARSER =================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// public/audio/*.mp3  ->  /api/audio/*.mp3
app.use(
  '/api/audio',
  express.static(path.join(process.cwd(), 'public/audio'), {
    acceptRanges: true, //  bắt buộc cho audio/video
  })
);

// ================= OTHER PUBLIC ASSETS =================
app.use(
  express.static(path.join(process.cwd(), 'public'), {
    index: false,
  })
);

// ================= LOGGING =================
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(requestLogger);

// ================= API ROUTES =================
app.use('/api', routes);

// ================= ERROR HANDLING =================
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
