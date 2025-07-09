// Server startup file
// This is the main entry point, similar to main() in Go
import app from './app';

// Server configuration
// In Go, this would be: server := &http.Server{Addr: ":3000", Handler: handler}
const PORT = process.env.PORT || 3000;

// Start the server
// Similar to: server.ListenAndServe() in Go
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown handling
// Similar to signal handling in Go applications
process.on('SIGTERM', () => {
  console.log('💀 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('💀 SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Handle uncaught exceptions
// Similar to defer/recover in Go
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});