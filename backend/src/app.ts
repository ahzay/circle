// Express app configuration
// This is similar to setting up a Go HTTP server with gorilla/mux
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import circlesRouter from './routes/circles';
import resourcesRouter from './routes/resources';
import borrowRequestsRouter from './routes/borrow-requests';

// Create Express application instance
// Similar to: mux := mux.NewRouter() in Go
const app = express();

// MIDDLEWARE SETUP
// In Go, middleware is typically handled with http.Handler wrappers
// Express uses .use() to apply middleware to all routes

// Security middleware - adds security headers
// Similar to setting security headers in Go HTTP handlers
app.use(helmet());

// Enable CORS for cross-origin requests
// Allows Angular frontend (localhost:4200) to call backend (localhost:3000)
// In Go, you'd manually set Access-Control-Allow-Origin headers
app.use(cors({
  origin: 'http://localhost:4200', // Angular dev server
  credentials: true // Allow cookies/auth headers
}));

// Compress responses to reduce bandwidth
// Similar to using gzip middleware in Go
app.use(compression());

// Parse JSON request bodies
// Similar to json.NewDecoder(r.Body).Decode() in Go handlers
app.use(express.json());

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// HTTP request logging
// Similar to custom logging middleware in Go
app.use(morgan('combined'));

// ROUTES
// In Go, you'd define routes with: router.HandleFunc("/health", healthHandler)

// Health check endpoint - similar to Go's health check handlers
app.get('/health', (req, res) => {
  // req = *http.Request, res = http.ResponseWriter in Go terms
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes - mount circle routes at /api/circles
// Similar to: router.PathPrefix("/api/circles").Subrouter() in Go
app.use('/api/circles', circlesRouter);

// Mount resource routes at /api/resources for individual resource operations
// Resource creation/listing is handled under /api/circles/:circleId/resources
app.use('/api/resources', resourcesRouter);

// Mount borrow request routes at /api/borrow-requests for borrowing workflow
// Handles the complete lifecycle: request -> approve/deny -> return
app.use('/api/borrow-requests', borrowRequestsRouter);

// Note: Catch-all route removed due to path-to-regexp issue
// Express will return 404 for undefined routes by default

// Error handling middleware
// Must be defined last - Express calls this when errors occur
// Similar to error handling in Go HTTP handlers
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error'
  });
});

export default app;