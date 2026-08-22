export function errorHandler(err, req, res, next) {
  console.error('[SERVER ERROR]:', err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Deep Space Gateway Error'
  });
}
