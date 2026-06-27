import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { apiLimiter } from './middleware/rateLimiter';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { openapiSpec } from './docs/openapi';

import authRoutes from './modules/auth/auth.routes';
import poojaRoutes from './modules/pooja/pooja.routes';
import bookingRoutes from './modules/booking/booking.routes';
import accommodationRoutes from './modules/accommodation/accommodation.routes';
import donationRoutes from './modules/donation/donation.routes';
import newsRoutes from './modules/content/news.routes';
import eventRoutes from './modules/content/event.routes';
import livestreamRoutes from './modules/content/livestream.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.corsOrigins,
      credentials: true,
    })
  );
  app.use(express.json());
  app.use('/api', apiLimiter);

  // Health check
  app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'temple-api' }));

  // API documentation (Swagger UI + raw OpenAPI JSON)
  app.get('/api/docs.json', (_req, res) => res.json(openapiSpec));
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec, {
    customSiteTitle: 'Sri Jagajjanani Temple API',
  }));

  // Feature routes
  app.use('/api/auth', authRoutes);
  app.use('/api/poojas', poojaRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/accommodation', accommodationRoutes);
  app.use('/api/donations', donationRoutes);
  app.use('/api/news', newsRoutes);
  app.use('/api/events', eventRoutes);
  app.use('/api/livestream', livestreamRoutes);
  app.use('/api/dashboard', dashboardRoutes);

  // 404 + error handling (must be last)
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
