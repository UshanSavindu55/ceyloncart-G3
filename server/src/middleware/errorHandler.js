export function notFoundHandler(request, response, next) {
  const error = new Error(`Route not found: ${request.method} ${request.originalUrl}`);
  error.status = 404;
  next(error);
}

export function errorHandler(error, request, response, next) {
  const status = error.status || error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  response.status(status).json({
    error: {
      message,
    },
  });
}